.PHONY: deploy favicon

favicon.ico:
	convert images/favicon-16.png -flatten -colors 256 -background transparent favicon.ico

favicon: favicon.ico

deploy:
	./deploy.sh

clean:
	rm -vf *_original
	rm -vf favicon.ico