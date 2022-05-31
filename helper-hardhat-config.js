const fs = require("fs");
const clientFolders = ["./client", "./client.wagmi"];

const frontEndMapFiles = clientFolders.map((folder) => {
  try {
    fs.readdirSync(`${folder}/src/chain-info/`);
  } catch (error) {
    try {
      fs.mkdirSync(`${folder}/src/chain-info/`);
    } catch (error) {
      console.log("Error with the folder=", error);
    }
  }
  const fileMap = `${folder}/src/chain-info/map.json`;
  const fileAbi = `${folder}/src/chain-info/`;
  return { fileMap, fileAbi };
});

module.exports = {
  frontEndMapFiles,
};
