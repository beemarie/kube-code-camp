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

```bash
  cd ../exercise-3b
```

1. Edit the hello-world-deployment file to include correct values for the image name -- based on registry, namespace, and project.  Remember, to edit the file you need to click the pencil icon and edit the file at `kube-code-camp/exercise-3b/hello-world-deployment.yml`. You will update `<registry>/<namespace>/<unique_appname>:1` to your image name. The line should look something like `us.icr.io/code-camp/bmv-app-123:1`. Save the file.

3. Create the hello world deployment. To create a Deployment using this configuration file we use the following command:

  ```bash
  kubectl create -f hello-world-deployment.yml
  ```

  ```bash
  deployment "hello-world" created  
  ```

4. We can then list the pods it created by listing all pods that have a label of "app" with a value of "hello-world". This matches the labels defined above in the yaml file in the spec.template.metadata.labels section.

  ```bash
  kubectl get pods -l app=hello-world
  ```

## Edit Configuration

1. When you change the number of replicas in the configuration, Kubernetes will try to add, or remove, pods from the system to match your request. You can make these modifications by using the following command:

  ```bash
  kubectl edit deployment hello-world
  ```

  This will retrieve the latest configuration for the Deployment from the Kubernetes server and then load it into an editor for you. You'll notice that there are a lot more fields in this version than the original yaml file we used. This is because it contains all of the properties about the Deployment that Kubernetes knows about, not just the ones we chose to specify when we create it. Also notice that it now contains the status section mentioned previously.

1. Try editing `replicas` to 4, under the `spec` section, near the top. This editor uses `vi` style commands. You can use `i` to insert, `w` to write, and `q` to quit.

1. If you run `kubectl get pods`, you should see that there are now 4 pods.

  You can also edit the deployment file we used to create the Deployment to make changes. You should use the following command to make the change effective when you edit the deployment locally. Run the `kubectl apply` command to set the replicas back to 3.

```bash
  kubectl apply -f hello-world-deployment.yml
```

  This will ask Kubernetes to "diff" our yaml file with the current state of the Deployment and apply just those changes.

1. Run `kubectl get pods` to see that there are now 3 pods.

## Create a Service

We can now define a Service object to expose the deployment to external clients.

1. We can now define a Service object to expose the deployment to external clients.

  ```bash
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

  ```bash
  kubectl create -f hello-world-service.yml
  ```

1. Let's see our pods being created:

  ```bash
  kubectl get pods
  ```

1. Let's test the hello-world app:

  ```bash
  curl $WORKER_IP:30073
  ```

## Clean Up

1. Let's also clean up the hello-world deployment and service we just created.

  ```bash
  kubectl delete -f hello-world-deployment.yml
  kubectl delete -f hello-world-service.yml
  ```

2. Finally, let's clean up the images from the registry.

  ```bash
  ibmcloud cr image-rm $MYREGISTRY/$MYNAMESPACE/$MYPROJECT:2
  ibmcloud cr image-rm $MYREGISTRY/$MYNAMESPACE/$MYPROJECT:1
  ```

Continue on to [Exercise 4](../exercise-4/README.md)
