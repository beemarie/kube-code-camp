# Deploy an application with IBM Watson services

In this lab, set up an application to leverage the Watson Tone Analyzer service. If you have yet to create a cluster, please refer to first lab of this course.

# Update the credentials.json file

1. Change to the Excercise 4 directory:

    ```bash
    cd ../exercise-4
    ```

2. Edit the credentials.json file found in `kube-code-camp/exercise-4/watson/credentials.json`. Remember that to edit this file, you need to click the pencil icon, edit the file at `kube-code-camp/exercise-4/watson/credentials.json` and then save the file. The apikey required for this section of the lab was provided for you as a part of the grant-clusters app. Update the apikey value now, and save the file.

3. Create a Kubernetes Secret based on the credentials stored in this file.

    ```bash
    kubectl create secret generic apikey --from-file=./watson/credentials.json 
    ```

## Build the Watson images

1. Create a unique application name for the watson app you're about to build. Something like `bmv-watson-1111`

    ```bash
    export MYWATSONAPP=<your_unique_name>
    ```

2. Build the image, and push it to the IBM Cloud Container Registry using the `ibmcloud cr build` command.

   ```bash
   ibmcloud cr build -t $MYREGISTRY/$MYNAMESPACE/$MYWATSONAPP ./watson
   ```

4. Create a unique application name for the watson-talk app you're about to create. Something like `bmv-watson-talk-1111`

    ```bash
    export MYTALKAPP=<your_unique_talk_app_name>
    ```
4. Build the `watson-talk` image, and push it to the IBM Cloud Container Registry using the `ibmcloud cr build` command.

   ```bash
   ibmcloud cr build -t $MYREGISTRY/$MYNAMESPACE/$MYTALKAPP ./watson-talk
   ```

6. In watson-deployment.yml, update the image tag with the registry path to the two images you just created in the following two sections. Remember, to update a file click the pencil icon, find the file at `kube-code-camp/exercise-4/watson-deployment.yml`. Remember to save once you've edited it.

    ```yaml
        spec:
          containers:
            - name: watson
              image: "<registry>/<namespace>/<watsonapp>" 
              # change to the path of the watson image you just pushed
              # ex: image: "de.icr.io/code-camp/bmv-watson-1234"
    ...
        spec:
          containers:
            - name: watson-talk
              image: "<registry>/<namespace>/<talkapp>" 
              # change to the path of the watson-talk image you just pushed
              # ex: image: "de.icr.io/code-camp/bmv-watson-talk-1234"
    ```

## Create pods and services

Now that the service is bound to the cluster, you want to expose the secret to your pod so that it can utilize the service. To do this, create a secret datastore as a part of your deployment configuration. This has been done for you in watson-deployment.yml:

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

1. Create the deployment and services making up your application using the .yml file.

   ```bash
   kubectl create -f watson-deployment.yml
   ```

2. Verify the pods have been created:

   ```bash
   kubectl get pods
   ```

## Putting it all together - Run the application and service

By this time you have created pods, services, and volumes for this lab.

1. You can open the Kubernetes dashboard and explore all the new objects created or use the following commands.

   ```bash
   kubectl get pods
   kubectl get deployments
   kubectl get services
   ```

2. Get the public IP for one of the worker nodes to access the application:

    ```bash
    ibmcloud ks workers $MYCLUSTER
    ```

3. Now that the you have the container IP and port, go to your favorite web browser and launch the following URL to analyze the text and see output.
 
   ```url
   http://<public-IP>:30080/analyze/"Today is a beautiful day"
   ```

If you can see JSON output on your screen, congratulations! You should see high percentages of `joy` and low percentages of emotions like `anger` or `disgust`. Try analyzing some different sentences to play around with the Tone Analyzer service. You are now done with this lab!

4. Clean up the deployment, pods, and services you created:

    ```bash
    kubectl delete -f watson-deployment.yml
    ```

Continue on to [Exercise 5](../exercise-5/README.md)