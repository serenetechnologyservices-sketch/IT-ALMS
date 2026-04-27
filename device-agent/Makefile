BINARY=device-agent
VERSION=1.0.0

.PHONY: build build-all clean

build:
	CGO_ENABLED=1 go build -ldflags="-s -w" -o $(BINARY) ./cmd/agent

build-linux:
	GOOS=linux GOARCH=amd64 CGO_ENABLED=1 go build -ldflags="-s -w" -o $(BINARY)-linux-amd64 ./cmd/agent

build-windows:
	GOOS=windows GOARCH=amd64 CGO_ENABLED=1 CC=x86_64-w64-mingw32-gcc go build -ldflags="-s -w" -o $(BINARY)-windows-amd64.exe ./cmd/agent

build-darwin:
	GOOS=darwin GOARCH=arm64 CGO_ENABLED=1 go build -ldflags="-s -w" -o $(BINARY)-darwin-arm64 ./cmd/agent

build-all: build-linux build-darwin

clean:
	rm -f $(BINARY) $(BINARY)-*

run:
	go run ./cmd/agent -config config.yaml

test:
	go test ./...
