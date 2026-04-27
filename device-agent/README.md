# Device Agent - Asset Intelligence Platform

Lightweight, cross-platform Go agent that collects system data, software inventory, performance metrics, and enforces compliance policies. Works offline-first with SQLite and syncs when the server is reachable.

## Build

```bash
# Current platform
make build

# macOS ARM64
make build-darwin

# Linux AMD64
make build-linux

# Run directly
make run
```

## Install as Service

### macOS (launchd)
```bash
sudo cp device-agent /usr/local/bin/
sudo mkdir -p /usr/local/etc/device-agent
sudo cp config.yaml /usr/local/etc/device-agent/
sudo cp service/launchd/com.assetplatform.device-agent.plist /Library/LaunchDaemons/
sudo launchctl load /Library/LaunchDaemons/com.assetplatform.device-agent.plist
```

### Linux (systemd)
```bash
sudo cp device-agent /opt/device-agent/
sudo cp config.yaml /opt/device-agent/
sudo cp service/systemd/device-agent.service /etc/systemd/system/
sudo systemctl enable device-agent
sudo systemctl start device-agent
```

### Windows
Run as a Windows Service using `sc create` or NSSM.

## Configuration

Edit `config.yaml` to set API URL, sync intervals, and agent token.
