#!/usr/bin/env node

const fs = require('fs');


const appname = process.argv[2];
const host = process.argv[3];
const username = process.argv[4]
const idRsaKeyName = process.argv[5];
const sshPort = process.argv[6];

const etc = (p = '') => `etc${p}`;
const binBash = `#!/bin/bash`;

fs.mkdirSync(etc());
const startFileContent = `${binBash}

cd /opt/${appname}
nodejs build/index.js
`;
fs.writeFileSync(etc('/start.sh'), startFileContent);
fs.mkdirSync(etc('/systemd'));
fs.mkdirSync(etc('/systemd/system'));

const serviceFileContent = `[Unit]
Description=${appname}
After=network.target

[Service]
Type=oneshot
User=appname
Group=appname

ExecStart=/opt/${appname}/etc/start.sh
ExecStop=/bin/kill -15 $MAINPID

[Install]
WantedBy=multi-user.target
`;
fs.writeFileSync(etc(`/systemd/system/${appname}.service`), serviceFileContent);

const uploadFileContent = `${binBash}

host="${host}"

# npm run test
npm run build

path="/opt/${appname}"

remove_list="$path/build $path/etc $path/package.json"
upload_list="build etc package.json"

echo "Upload path: $path@$host"
read -p "Do you want to upload on $host y/n? " -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "File list for cleaning: $remove_list"
  echo "Cleaning..."
  ssh -i ~/.ssh/${idRsaKeyName} ${username}@$host -p${sshPort} "rm -rf $remove_list"

  echo "File list for uploading: $upload_list"
  echo "Loading..."
  scp -i ~/.ssh/${idRsaKeyName} -P ${sshPort} -r $upload_list ${username}@$host:$path
fi
`;
fs.writeFileSync('upload.sh', uploadFileContent);
