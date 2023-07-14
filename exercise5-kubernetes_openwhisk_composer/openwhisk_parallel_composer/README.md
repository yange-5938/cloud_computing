# Cloud Computing Kubernetes, OpenWhisk Project

## Kubernetes, OpenWhisk

### 1. Get an Instance with N1-2
+ Make sure the ports are enabled.
+ GCP can use `gcloud compute ssh` for ssh connection 

### 2. install Docker Engine
+ Follow the installation steps: https://docs.docker.com/engine/install/ubuntu/
+ Do the postinstall steps (set non-root user in docker group): https://docs.docker.com/engine/install/linux-postinstall/

### 3. Install Kubernetes
+ Install kubeadm, kubelet and kubectl and kubernetes-cni: https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/ 
```bash
$ sudo apt-get install -y kubelet kubeadm kubectl kubernetes-cni
```

### 4. Run Kubernetes
+ Init Kubernetes control-plane node: https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/
```bash
# setup CIDR for Flannel 
$ sudo kubeadm init --pod-network-cidr=10.244.0.0/16
```
+ If error _[ERROR CRI]: container runtime is not running_ with init, follow this guide: https://k21academy.com/docker-kubernetes/container-runtime-is-not-running/
```bash
$ sudo rm /etc/containerd/config.toml
$ sudo systemctl restart containerd
```
+ Configure the regular user
```bash
$ mkdir -p $HOME/.kube
$ sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
$ sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

+ Install the Pod network with `kubectl apply`
```bash
$ kubectl apply -f https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml

# after the created to check is pods are created with
$ kubectl get pods -A
```
+ Enable pod Scheduling on Control-Plane (because we only has one node)
```bash
$ kubectl taint nodes --all node-role.kubernetes.io/control-plane-
```
### 5. Join a worker node
+ Create the worker node from Step 1-3, before `kubeadm init`
+ Control-plane create a token and worker performs `kubeadm join`
```bash
# In control-plane node
control-plane $ kubeadm token create --print-join-command

# Output e.g. kubeadm join 10.186.0.4:6443 --token djril3.vqhwgrpig5y01eb5 --discovery-token-ca-cert-hash sha256:79289bfc3b6a1de8702f6a41c9415740f8686356c4e016e76b13ff5780c1456c

# change to worker node
worker $ sudo kubeadm join 10.186.0.4:6443 --token djril3.vqhwgrpig5y01eb5 --discovery-token-ca-cert-hash sha256:79289bfc3b6a1de8702f6a41c9415740f8686356c4e016e76b13ff5780c1456c

# check the nodes
control-plane $ kubectl get nodes
```

+ Reset form Init or Join
```bash
# drain the node
control-plane $ kubectl drain <node-name> --ignore-daemonsets
# delte the node
control-plane $ kubectl delete node <node-name>

# worker reset
worker $ sudo kubeadm reset

## After reset, join to a cluster again or kubeadm init WILL NOT change .kube/config automatically, if kubectl still use old config could leads to problem.
## My solution is the copy the config file from /etc/kubernetes/kubelet.conf to $Home/.kube/config, and chown it and all its dependencies.

```

### 6. Helm and OpenWhisk
+ Install Helm: https://helm.sh/docs/intro/install/
+ Install OpenWhisk: https://github.com/apache/openwhisk-deploy-kube/tree/master
+ Install OpenWhisk CLI: https://github.com/apache/openwhisk-cli

+ label all nodes as Invoker 

+ install openwhisk:
```bash 
# create the mycluster.yaml file
$ helm install owdev openwhisk/openwhisk -n openwhisk --create-namespace -f mycluster.yaml

## I encountered the problem that owdev-install-packages-2dztw has Error status
## it's because of the absence of npm

# set the apihost property <ip>:<port>
$ wsk property set --apihost 10.186.0.4:31001 

## I don't know why this auth works, I suspect it's the default auth
$ wsk property set --auth 23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP

# check the connection with
$ wsk -i package list /whisk.system
```

+ other commands:
```bash
# helm show all the release
$ helm list -A

# helm delete <release> -n <namespace>
$ helm uninstall owdev -n openwhisk
```

### 7. Applicaiton Deployment

+ preparation
```bash
# install openwhisk-composer package
## try not to install composer with sudo
$ npm install -g openwhisk-composer

# clone the project
$ git clone https://github.com/kky-fury/openwhisk_parallel_composer.git
```

+ get mongodb running
```bash
# compose it
$ docker-compose up -d

# exec into the container 
$ docker exec -it 24d3c4b89f4f sh
## or you can just install the mongo-client, and use the cli to connect to the db, because the port is mapped anyway, as in docker-compose.yml.

#check connection and authentication
$ mongo --host 127.0.0.1 --port 27017
mongocli $ db.auth("myuser","mypassword")

# create a user
$ mongo
mongocli $ use userinfo
mongocli $ db.createUser({....})

# import the data
sh $ mongoimport --host 127.0.0.1 -u myuser -p mypassword --jsonArray --db userinfo --collection products --file MOCK_DATA.json --authenticationDatabase userinfo
```

+ Deploy functions

```bash
$ wsk -i action create hello-world hello-world.js
$ wsk -i action create product-url product-url.js --docker openwhiskansjin/action-nodejs-v14:mongo 
$ wsk -i action create product-name product-name.js --docker openwhiskansjin/action-nodejs-v14:mongo 
$ wsk -i action create product-price product-price.js --docker openwhiskansjin/action-nodejs-v14:mongo 

# compose and deploy the stuff: https://github.com/apache/openwhisk-composer/blob/master/docs/COMMANDS.md

$ compose composition.js > myCompose.json
$ deploy composition myCompose.json -i

$ wsk -i action create test_ow_functions test_ow_function.js

# test test_ow_functions
$ wsk -i action invoke test_ow_functions --result
```

+ some wsk usages
```bash
# wsk list actions
$ wsk -i action list

# get wsk action detail
$ wsk -i action get hello-world

# wsk invoke action
$ wsk -i action invoke hello-world --param name Bob --param what ever --result

# careful with the mongo_host_ip, openwhisk action cannot directly access a port on local machine
$ wsk -i action invoke product-url --param product_id 23 --param mongo_host_ip "localhost" --param db "userinfo" --param collection products --param mongo_user myuser --param mongo_pass mypassword --result

## I found these people has the mongodb online 
$ wsk -i action invoke product-url --param product_id 23 --param mongo_host_ip "138.246.238.62" --param db "ccs" --param collection products --param mongo_user root --param mongo_pass ccs_root_Pass_7631 --result

# wsk delete action
$ wsk -i action delete hello-world

# check wsk logs
$ wsk -i activation list
$ wsk -i activation logs 5f2f7fa93e8d4e4baf7fa93e8d6e4b33
```
