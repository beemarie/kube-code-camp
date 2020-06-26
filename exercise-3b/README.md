# Create and Scale App with yaml

In this lab you'll learn how to deploy the same hello world application we deployed in the previous labs, however, instead of using the kubectl command line helper functions we'll be deploying the application using configuration files. The configuration file mechanism allows you to have more fine-grained control over all of resources being created within the Kubernetes cluster.

## Scale apps

Kubernetes can deploy an individual pod to run an application but when you need to scale it to handle a large number of requests a `Deployment` is the resource you want to use. A Deployment manages a collection of similar pods. When you ask for a specific number of replicas the Kubernetes Deployment Controller will attempt to maintain that number of replicas at all times.

Every Kubernetes object we create should provide two nested object fields that govern the object’s configuration: the object spec and the object status. Object spec defines the desired state, and object status contains Kubernetes system provided information about the actual state of the resource. As described before, Kubernetes will attempt to reconcile your desired state with the actual state of the system.

For each Object that we create we need to provide the apiVersion we are using to create the object, the kind of the object we are creating and the metadata about the object such as a name, set of labels and optionally namespace that this object should belong in.

Consider the following deployment configuration for the hello world application

hello-world-deployment.yaml

    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: hello-world
      labels:
        app: hello-world
    spec:
      replicas: 3
      selector:
        matchLabels:
          app: hello-world
      template:
        metadata:
          labels:
            app: hello-world
        spec:
          containers:
          - name: hello-world
            image: <registry>/<namespace>/<unique_appname>:1
            ports:
            - name: http-server
              containerPort: 8080
      ```

The above configuration file create a deployment object named 'hello-world' with a pod containing a single container running the image. Also the configuration specifies replicas set to 3 and Kubernetes tries to make sure that at least three active pods are running at all times.

1. Change directories to exercise 3b.
  ```
  cd ../exercise-3b
  ```

2. Use this script to replace the values in hello-world-deployment file with your values.
  ```
  envsubst < ./hello-world-deployment.yaml > ./my-hello-world-deployment.yaml
  cat ./my-hello-world-deployment.yaml
  ```
3. Create the hello world deployment. To create a Deployment using this configuration file we use the following command:

  ```
  kubectl create -f my-hello-world-deployment.yaml
  ```

2. We can then list the pods it created by listing all pods that have a label of "app" with a value of "hello-world". This matches the labels defined above in the yaml file in the spec.template.metadata.labels section.

  ```
  kubectl get pods -l app=hello-world
  ```

## Edit Configuration

1. Set your kubectl editor to nano
  ```
  export KUBE_EDITOR="nano"
  ```
2. When you change the number of replicas in the configuration, Kubernetes will try to add, or remove, pods from the system to match your request. You can make these modifications by using the following command:

  ```
  kubectl edit deployment hello-world
  ```

  This will retrieve the latest configuration for the Deployment from the Kubernetes server and then load it into an editor for you. You'll notice that there are a lot more fields in this version than the original yaml file we used. This is because it contains all of the properties about the Deployment that Kubernetes knows about, not just the ones we chose to specify when we create it. Also notice that it now contains the status section mentioned previously.

1. Try editing `replicas` to 4, under the `spec` section, near the top. Use Ctrl-X to exit, press Y to save and hit Enter.

1. List the pods and you should see that there are now 4 pods.

  ```
  kubectl get pods
  ```

  To make changes, you can also edit the deployment file we used to create the Deployment. Then those changes need to be applied. Apply the current configuration to set the replicas back to three.

  ```
  kubectl apply -f my-hello-world-deployment.yaml
  ```
  This will ask Kubernetes to "diff" our yaml file with the current state of the Deployment and apply just those changes.

1. List the pods to see that there are now three.

  ```
  kubectl get pods
  ```

## Create a Service

We can now define a Service object to expose the deployment to external clients.

1. We can now define a Service object to expose the deployment to external clients.

  ```
  apiVersion: v1
  kind: Service
  metadata:
    name: hello-world
    labels:
      app: hello-world
  spec:
    selector:
      app: hello-world
    type: NodePort
    ports:
    - protocol: TCP
      port: 8080
      nodePort: 30073
  ```

The above configuration creates a Service resource named hello-world. A Service can be used to create a network path for incoming traffic to your running application. In this case, we are setting up a route from port 3000 on the cluster to the "http-server" port on our app, which is port 3000 per the Deployment container spec.

1. Let us now create the hello-world service using the same type of command we used when we created the Deployment:
  ```
  kubectl create -f hello-world-service.yml
  ```

1. Let's see our pods being created:
  ```
  kubectl get pods
  ```

1. Let's test the hello-world app:

  ```
  curl $WORKER_IP:30073
  ```

## Clean Up

1. Let's also clean up the hello-world deployment and service we just created.
  ```
  kubectl delete -f my-hello-world-deployment.yaml
  kubectl delete -f hello-world-service.yml
  ```

2. Finally, let's clean up the images from the registry.

  ```
  ibmcloud cr image-rm $MYREGISTRY/$MYNAMESPACE/$MYPROJECT:2
  ibmcloud cr image-rm $MYREGISTRY/$MYNAMESPACE/$MYPROJECT:1
  ```
