.PHONY: deploy

deploy:
	source .env && scp index.html chalkboard-3840.png GochiHand-Regular.ttf olau@${HOST}:${DEST_DIR}