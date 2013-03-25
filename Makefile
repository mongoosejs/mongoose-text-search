
test:
	@./node_modules/.bin/mocha -g integration -i --reporter list $(T)

test-all:
	@./node_modules/.bin/mocha --reporter list $(T)

.PHONY: test
