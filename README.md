# systemd-express-boilerplate
Boilerplate repo for services based on NodeJS Express Framework and Systemd

## Installation
```bash
npm ci
npm run ssl-gen
npm start
```

## Using:
 - Create controller in `src/server/controllers` extended from BaseController
 - Declare body schema based on io-ts
  https://github.com/gcanti/io-ts/blob/master/Decoder.md
```js
const OrderData = D.struct({
    username: D.string,
    amount: D.number,
});
```
 - Add your route and define controller in `src/server/routes`

## Deploy:
Create your upload script and systemd config by gen.js script
```bash
./gen.js awesome-app example.com johnjacobs johnjacobs_id_rsa 22
```

Where:

`awesome-app` - is your app and systemd service name

`host` - address of your remote host

`username` - linux user

`idRsaKeyName` - key filename in ~/.ssh/ folder

`sshPort` - ssh port of remote host

On remote host:
```
mkdir /opt/service-name
chown -R johnjacobs:johnjacobs /opt/service-name
```

Next, build and upload the service 
```bash
./upload.sh
```

On remote host
```
cd /opt/service-name
npm ci
ln -sf /opt/service-name/etc/systemd/system/service-name.service /etc/systemd/system
```

Start service:
```
systemctl start service-name
```
