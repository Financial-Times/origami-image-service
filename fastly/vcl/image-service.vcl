import querystring;

sub set_backend {
	# The Fastly macro is inserted before the backend is selected because the
	# macro has the code which defines the values avaiable for req.http.Host
	# but it also contains a default backend which is always set to the EU. I wish we could disable the default backend setting.
	#FASTLY recv
	
	# Calculate the ideal region to route the request to.
  	declare local var.region STRING; 
	if (server.region ~ "(APAC|Asia|North-America|South-America|US-Central|US-East|US-West)") {
		set var.region = "US";
  	} else {
		set var.region = "EU";
  	}

	# Gather the health of the shields and origins.
	declare local var.eu_is_healthy BOOL;
	set req.backend = F_eu;
	set var.eu_is_healthy = req.backend.healthy;

	declare local var.us_is_healthy BOOL;
  	set req.backend = F_us;
  	set var.us_is_healthy = req.backend.healthy;

  	declare local var.shield_eu_is_healthy BOOL;
  	set req.backend = ssl_shield_london_city_uk;
  	set var.shield_eu_is_healthy = req.backend.healthy;

  	declare local var.shield_us_is_healthy BOOL;
  	set req.backend = ssl_shield_iad_va_us;
  	set var.shield_us_is_healthy = req.backend.healthy;

  	# Set some sort of default, that shouldn't get used.
  	set req.backend = F_eu;

	declare local var.EU_shield_server_name STRING;
	set var.EU_shield_server_name = "LCY";

	declare local var.US_shield_server_name STRING;
	set var.US_shield_server_name = "IAD";

	# Route EU requests to the nearest healthy shield or origin.
  	if (var.region == "EU") {
		if (server.datacenter != var.EU_shield_server_name && req.http.Request_Came_From_Shield != var.EU_shield_server_name && var.shield_eu_is_healthy) {
			set req.backend = ssl_shield_london_city_uk;
		} elseif (var.eu_is_healthy) {
			set req.backend = F_eu;
			set req.http.Host = req.http.EU_Host;
		} elseif (var.shield_us_is_healthy) {
			set req.backend = ssl_shield_iad_va_us;
		} elseif (var.us_is_healthy) {
			set req.backend = F_us;
			set req.http.Host = req.http.US_Host;
		} else {
			# Everything is on fire... but lets try the origin anyway just in case
			# it's the probes that are wrong
			# set req.backend = F_origin_last_ditch_eu;
		}
  	}

	# Route US requests to the nearest healthy shield or origin.
  	if (var.region == "US") {
		if (server.datacenter != var.US_shield_server_name && req.http.Request_Came_From_Shield != var.US_shield_server_name && var.shield_us_is_healthy) {
			set req.backend = ssl_shield_iad_va_us;
		} elseif (var.us_is_healthy) {
			set req.backend = F_us;
			set req.http.Host = req.http.US_Host;
		} elseif (var.shield_eu_is_healthy) {
			set req.backend = ssl_shield_london_city_uk;
		} elseif (var.eu_is_healthy) {
			set req.backend = F_eu;
			set req.http.Host = req.http.EU_Host;
		} else {
			# Everything is on fire... but lets try the origin anyway just in case
			# it's the probes that are wrong
			# set req.backend = F_origin_last_ditch_us;
		}
	}

	# Persist the decision so we can debug the result.
  	set req.http.Debug-Backend = req.backend;
}

sub vcl_recv {
	if (req.http.Fastly-Debug) {
		call breadcrumb_recv;
	}

		set req.url = regsub(req.url, "^/__origami/service/image","");
		set req.http.FT-Origami-Service-Base-Path = "/__origami/service/image/";

		if (req.http.Accept ~ "image/webp") {
			set req.http.FT-image-format = "webp";
		} elseif (req.http.Accept ~ "image/jxr") {
			set req.http.FT-image-format = "jpegxr";
		} else {
			set req.http.FT-image-format = "default";
		}

		set req.http.FT-Skip-Cache = "no";

	# Sort the querystring parameters alphabetically to improve chances of hitting a cached copy.
	# If querystring is empty, remove the ? from the url.
	set req.url = querystring.clean(querystring.sort(req.url));
	call set_backend;
}

sub vcl_hash {
	if (req.http.Fastly-Debug) {
		call breadcrumb_hash;
	}

	# Do not add the host header because it can have 1 of 3 values: origami-image-service.in.ft.com, origami-image-service-eu.herokuapp.com , origami-image-service-us.herokuapp.com
	# set req.hash += req.http.host;
	
	# Do not include the source query parameter in the url when adding the url to the hash but do include whether the url did have a source parameter at all
	set req.hash += querystring.filter(req.url, "source");
	if (std.strlen(subfield(req.url.qs, "source", "&")) > 0) {
		set req.hash += "has source parameter";
	} else {
		set req.hash += "does not have source parameter";
	}

	# We include return(hash) to stop the function falling through to the default VCL built into varnish, which for vcl_hash will add req.url and req.http.Host to the hash.
	return(hash);
}


sub shielding_header {
	if (req.backend == ssl_shield_iad_va_us) {
		set req.http.Request_Came_From_Shield = server.datacenter;
	} elsif (req.backend == ssl_shield_london_city_uk) {
		set req.http.Request_Came_From_Shield = server.datacenter;
	}
}

sub vcl_miss {
	if (req.http.Fastly-Debug) {
		call breadcrumb_miss;
	}
	call shielding_header;
}

sub vcl_pass {
	if (req.http.Fastly-Debug) {
		call breadcrumb_pass;
	}
	call shielding_header;
}

sub vcl_fetch {
	set beresp.http.Request_Came_From_Shield = req.http.Request_Came_From_Shield;
	if (req.http.Fastly-Debug) {
		call breadcrumb_fetch;
	}
	set beresp.http.Timing-Allow-Origin = "*";
}

sub vcl_deliver {
	if (req.http.Fastly-Debug) {
		call breadcrumb_deliver;
	}

	set req.http.Fastly-Force-Shield = "yes";

	add resp.http.Server-Timing = fastly_info.state {", fastly;desc="Edge time";dur="} time.elapsed.msec;

	if (req.http.Fastly-Debug) {
		set resp.http.Debug-Backend = req.http.Debug-Backend;
		set resp.http.Debug-Host = req.http.Host;
		set resp.http.Debug-Fastly-Restarts = req.restarts;
		set resp.http.Debug-Orig-URL = req.http.Orig-URL;
		set resp.http.Debug-VCL-Route = req.http.X-VCL-Route;
	} else {
		unset resp.http.Server;
		unset resp.http.Via;
		unset resp.http.X-Cache;
		unset resp.http.X-Cache-Hits;
		unset resp.http.X-Served-By;
		unset resp.http.X-Timer;
		unset resp.http.Fastly-Restarts;
		unset resp.http.X-PreFetch-Pass;
		unset resp.http.X-PreFetch-Miss;
		unset resp.http.X-PostFetch;
	}
}
