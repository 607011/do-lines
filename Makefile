.PHONY: deploy

favicon:
	convert images/favicon-16.png -flatten -colors 256 -background transparent favicon.ico

deploy:
	./deploy.sh