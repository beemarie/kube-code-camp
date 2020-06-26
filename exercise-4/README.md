# Deploy an application with IBM Watson services

In this section, you will deploy an application that leverages the Watson Speech To Text service.

## Create the Watson Speech To Text Service (Skip if the Watson API key is provided for you)
In this section, you will create the Watson service in your own account and get the service credentials.

1. Go to cloud.ibm.com and using the account switcher drop down, switch to your own Account.
2. Click on the **Catalog**, search for **Speech To Text** service and **Create**
3. Click on **Service Credentials** on the left
4. Click the dropdown arrow on the credentials to expand it.
5. Take note of the `apikey` value. You will need this key in the next section

## Update the credentials.json file
1. Change to the Exercise 4 directory:

    ```
    cd ../exercise-4
    ```

2. Edit the credentials.json file found in `watson/credentials.json`.

  ```
  nano watson/credentials.json
  ```

3. Update the `apikey` value with the value from the previous section and then save the file.

4. Create a Kubernetes Secret from on the credentials stored in this file.

    ```
    kubectl create secret generic apikey --from-file=./watson/credentials.json
    ```
5. Run `kubectl get secret` to see your secret called `apikey`


## Build the image for the Watson Speech to Text application

1. Create a unique application name for the watson app you're about to build. Something like `bmv-watson-1111`

    ```
    export MYWATSONAPP=<your_unique_name>
    ```

2. Build the image, and push it to the IBM Cloud Container Registry using the `ibmcloud cr build` command.

   ```
   ibmcloud cr build -t $MYREGISTRY/$MYNAMESPACE/$MYWATSONAPP ./watson
   ```
3. List images to find your new image. You will need the image name in the next step.

  ```
  ibmcloud cr images
  ```

3. Edit the watson-deployment.yml file and update the image tag with the registry path to the image you just created.

  ```
  nano watson-deployment.yml
  ```

  Here is the relevant part for you to edit:
    ```yml
    spec:
      containers:
        - name: watson-speech-to-text
          image: "us.icr.io/<namespace>/<appname>" # edit here!
          # change to the path of the watson image you just built and pushed
          # ex: image: "us.icr.io/code-camp/bmv-watson-1234"
    ```

## Share the Watson API Credentials with your application
Take a close look at the watson-deployment.yaml and look for the volumeMounts and volumes section. This is how we tell Kubernetes to share the `apikey` secret we created with the container. It writes the contents of the secret into /var/credentials of the container.

  ```yml
  volumeMounts:
    - mountPath: /var/credentials
      name: apikeyvol
  ...
  volumes:
    - name: apikeyvol
      secret:
        secretName: apikey
  ```
There is nothing you need to do for this section.

## Create deployments, pods and services
The yaml file has everything we need defined. We simply give this file to kubectl to apply the configuration.

1. Create the deployment, pods and services making up your application using the .yml file.

   ```
   kubectl apply -f watson-deployment.yml
   ```
1. You can open the Kubernetes dashboard and explore all the new objects created or use the following commands.

   ```
   kubectl get pods,deployments,services
   ```

## Expose this application to the public internet using the IKS Ingress ALB

In the previous sections, you exposed applications using service type `NodePort`. NodePort is good for development purposes, but when you are ready to go live, you need a permanent IP address or host name. For that, you need to create a service type of either `LoadBalancer` or create a Kubernetes `Ingress`.

Standard clusters on IKS come with an IBM-provided domain. This gives you a better option to expose applications with a proper URL and on standard HTTP/S ports. In this section, we'll use Ingress to set up the cluster inbound connection to the service.
![](https://cloud.ibm.com/docs-content/v1/content/4fb01670d36e2a82c7b5e9c5ff5a93068dbf2826/tutorials/images/solution2/Ingress.png)

1. Get the Ingress information for your cluster

    ```
    ibmcloud ks cluster get --cluster $MYCLUSTER
    ```
    Example output:
    ```
    Name:                           mydemocluster
    ID:                             f4f207d35a2b4fe98998d7ba0d
    State:                          normal
    Created:                        2018-12-06T16:11:59+0000
    Location:                       dal13
    ...
    Ingress Subdomain:              mydemocluster.us-south.containers.appdomain.cloud
    Ingress Secret:                 mydemocluster
    ...
    ```

2. Note the `Ingress Subdomain` and `Ingress Secret` values. You'll need this in the next step.

3. In `watson-ingress.yaml`, update the three locations marked `<Ingress Subdomain>` and `<Ingress Secret>`.

  ```
  nano watson-ingress.yaml
  ```

  Here is the relevant portion you need to edit:
  ```
  spec:
    tls:
    - hosts:
      - watson.<Ingress Subdomain>
      secretName: <Ingress Secret>
    rules:
    - host: watson.<Ingress Subdomain>
    ```

    ![](../README_images/watson-ingress.png)

4. Apply this yaml to your cluster.
    ```
    kubectl apply -f watson-ingress.yaml
    ```
4. In a new browser tab, go to your application! The URL will be `https://watson.<Ingress Subdomain>`


![](../README_images/watson-stt.png)

You should be able to click the **Record** button and start speaking into your microphone. Watch the text get trascribed live!

## Clean up

1. Clean up the deployment, pods, and services you created:

    ```
    kubectl delete -f watson-deployment.yml
    ```
2. Clean up the Ingress you created:

 ```
 kubectl delete -f watson-ingress.yaml
 ```

3. If you created a Watson Speech to Text service at the beginning of this exercise, return to the browser tab where it is open. Click `Actions > Delete Service` and then click 'Ok' to delete the service.

Continue on to [Exercise 5](../exercise-5/README.md)
