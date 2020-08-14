# Role Based Access Control (RBAC)

In this part of our lab we'll be learning a little bit about how RBAC works. To accomplish this we'll practice creating a few RBAC policies and reviewing what the imapact is of the policies we create.  IKS also makes available very powerful IBM Cloud IAM integration with RBAC, but here we'll get our hands dirty by implementing it manually.


## Setup service accounts

1. For this exercise we'll create a couple of new namespaces and service accounts to allow us to easily demonstrate the RBAC functionality

```
kubectl create ns team-a
kubectl -n team-a create serviceaccount travis
kubectl create ns team-b
kubectl -n team-b create serviceaccount jenkins
```

2. Here we'll set a couple of environment variables to let us "impersonate" the service accounts by using their tokens for auth.
```
TRAVIS_KUBE_TOKEN=`kubectl -n team-a get secret $(kubectl -n team-a get secret | grep travis | awk '{print $1}') -o json | jq -r '.data.token'  | base64 -d`
```

```
JENKINS_KUBE_TOKEN=`kubectl -n team-b get secret $(kubectl -n team-b get secret | grep jenkins | awk '{print $1}') -o json | jq -r '.data.token'  | base64 -d`
```

3. Now that we have authentication, lets try out our new service accounts
```
kubectl --token=$TRAVIS_KUBE_TOKEN get deployments -n team-a
kubectl --token=$JENKINS_KUBE_TOKEN get deployments -n team-b
```

You'll find that both requests will fail as we have not provided these accounts with any RBAC authorization yet.

## Create our RBAC

In Kubernetes, a `Role` can only be used to grant access to resources within a single namespace. A `ClusterRole` can be used to grant the same permissions as a `Role`, but because they are cluster-scoped, they can also be used to grant access to cluster-scoped resources (like nodes), non-resource endpoints (like “/healthz”), and namespaced resources (like pods) across all namespaces.

A `RoleBinding` grants the permissions defined in a role to a user or set of users.

Source and additional reading: https://kubernetes.io/docs/reference/access-authn-authz/rbac/.

1. Create a ClusterRole as well as some bindings in order to authorize our service accounts to manage deployments. Copy and paste the following 3 commands into your CLI to create the ClusterRole and RoleBindings.

```
cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRole
metadata:
  name: cicd-apps
rules:
- apiGroups:
  - apps
  - extensions
  resources:
  - deployments
  - replicasets
  verbs:
  - create
  - delete
  - deletecollection
  - get
  - list

EOF
```


```
cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: travis-apps
  namespace: team-a
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cicd-apps
subjects:
- kind: ServiceAccount
  name: travis
  namespace: team-a
EOF
```

```
cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: jenkins-apps
  namespace: team-b
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cicd-apps
subjects:
- kind: ServiceAccount
  name: jenkins
  namespace: team-b
EOF
```

2. Let's try pulling those deployments again.
```
kubectl --token=$TRAVIS_KUBE_TOKEN get deployments -n team-a
kubectl --token=$JENKINS_KUBE_TOKEN get deployments -n team-b
```

## Cleanup
1. Clean up the two namespaces and the ClusterRole that you created.

```
kubectl delete ns team-a team-b
kubectl delete clusterrole cicd-apps
```

Congratulations! You have completed the Introduction to Kubernetes Lab!
