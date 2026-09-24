# Self-host LiveKit (گلستان شادی)

Cloud (`*.livekit.cloud`) is fine on your laptop. Production for سهند should be **your** server.

## Buy

- VPS: Hetzner CX22 / CPX21 in Falkenstein or Helsinki (~€6–8/mo). Not AWS/Azure/GCP.
- Domain: `class.yourdomain.com` + `turn.yourdomain.com` pointing to that IP.

## Generate compose

```bash
docker pull livekit/generate
docker run --rm -it -v $PWD:/output livekit/generate
```

Turn **TURN/TLS on port 443** on. Iran often allowlists only 80/443.

## App env

```
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_URL=wss://class.yourdomain.com
NEXT_PUBLIC_LIVEKIT_URL=wss://class.yourdomain.com
LIVEKIT_FORCE_RELAY=1
```

Restart `npm run dev` / the Node process after env changes.

## Test from Iran

1. https://livekit.io/webrtc/browser-test
2. Join one room on همراه اول and ایرانسل
3. If UDP dies but 443 works, keep `iceTransportPolicy: relay`

Rotate any key that was ever pasted in chat.
