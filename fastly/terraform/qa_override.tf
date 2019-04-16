resource "fastly_service_v1" "app" {
  domain {
    name = "origami-image-service-qa.in.ft.com"
  }

  backend {
    name                  = "eu"
    address               = "origami-image-service-qa.herokuapp.com"
    port                  = 443
    healthcheck           = "eu_healthcheck"
    ssl_cert_hostname     = "*.herokuapp.com"
    auto_loadbalance      = false
    connect_timeout       = 5000
    first_byte_timeout    = 120000
    between_bytes_timeout = 120000
    error_threshold       = 0
    shield                = "london_city-uk"
  }

  healthcheck {
    name      = "eu_healthcheck"
    host      = "origami-image-service-qa.herokuapp.com"
    path      = "/__gtg"
    timeout   = 5000
    threshold = 2
    window    = 5
  }

  backend {
    name                  = "us"
    address               = "origami-image-service-qa.herokuapp.com"
    port                  = 443
    healthcheck           = "us_healthcheck"
    ssl_cert_hostname     = "*.herokuapp.com"
    auto_loadbalance      = false
    connect_timeout       = 5000
    first_byte_timeout    = 120000
    between_bytes_timeout = 120000
    error_threshold       = 0
    shield                = "iad-va-us"
  }

  healthcheck {
    name      = "us_healthcheck"
    host      = "origami-image-service-qa.herokuapp.com"
    path      = "/__gtg"
    timeout   = 5000
    threshold = 2
    window    = 5
  }

  header {
    name        = "EU Host"
    action      = "set"
    type        = "request"
    destination = "http.EU_Host"
    source      = "\"origami-image-service-qa.herokuapp.com\""
  }

  header {
    name        = "US Host"
    action      = "set"
    type        = "request"
    destination = "http.US_Host"
    source      = "\"origami-image-service-qa.herokuapp.com\""
  }
}
