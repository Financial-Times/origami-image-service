provider "fastly" {
  version = "~> 0.8"
}

variable "domain" {
  type    = "string"
  default = "https://image.origami.ft.com/"
}

variable "name" {
  type    = "string"
  default = "Origami Image Service"
}

output "service_id" {
  value = ["${fastly_service_v1.app.id}"]
}

resource "fastly_service_v1" "app" {
  name = "${var.name}"

  force_destroy = false

  domain {
    name = "${var.domain}"
  }

  vcl {
    name    = "main.vcl"
    content = "${file("${path.module}/../vcl/main.vcl")}"
    main    = true
  }

  vcl {
    name    = "image-service.vcl"
    content = "${file("${path.module}/../vcl/image-service.vcl")}"
  }

  vcl {
    name    = "fastly-boilerplate-begin.vcl"
    content = "${file("${path.module}/../vcl/fastly-boilerplate-begin.vcl")}"
  }

  vcl {
    name    = "fastly-boilerplate-end.vcl"
    content = "${file("${path.module}/../vcl/fastly-boilerplate-end.vcl")}"
  }

  vcl {
    name    = "breadcrumbs.vcl"
    content = "${file("${path.module}/../vcl/breadcrumbs.vcl")}"
  }
}
