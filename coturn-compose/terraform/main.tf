resource "hcloud_server" "node" {
  name = "mutiny"
  image = "ubuntu-20.04"
  server_type = "cx11"
  location = "nbg1" 
  ssh_keys = ["ubuntu-pc"]
}

output "ip" {
    description = "The ip of the server"
    value = "${hcloud_server.node.ipv4_address}"
}
