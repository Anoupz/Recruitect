# Uses the latest debian image. As of now, its 'jessie'
FROM debian

# Docker mantainer
MAINTAINER Anoop

# downloads the package lists from the repositories and "updates" them to get information
# on the newest versions of packages and their dependencies.
RUN apt-get update && apt-get install -y \
	curl \
	python \
	make \
	g++ \
	git-core \
	nginx
  
# Uses the NODEJS 6.x library source
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN apt-get update && apt-get install -y \
	nodejs

# Installs all the build tools for node like NPM to the $PATH
RUN apt-get install -y build-essential

# Mutes the npm installation progress logging
RUN npm set progress=false

# install our dependencies and nodejs
RUN npm install -g gulp

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
ADD package.json /tmp/package.json
RUN cd /tmp && npm install

# Move the node_modules from /tmp to /src
RUN mkdir -p /src && cp -a /tmp/node_modules /src/

# From here we load our application's code in, therefore the previous docker
# "layer" thats been cached will be used if possible
WORKDIR /src
ADD . /src

# Expose 3000 port to nginx
EXPOSE 3000

# Start nginx server and kickstart gulp build workflow
# Start nginx server and kickstart gulp build workflow
CMD gulp serve:dist
CMD gulp serve:dist
