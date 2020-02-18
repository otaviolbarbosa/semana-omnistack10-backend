const axios = require("axios");
const Dev = require("../models/Dev");
const { findConnections, sendMessage } = require("../websocket");

const parseStringAsArray = require("../utils/parseStringAsArray");

module.exports = {
  async index(req, res) {
    const devs = await Dev.find();

    return res.json(devs);
  },
  async store(req, res) {
    const { github_username, techs, latitude, longitude } = req.body;

    let dev = await Dev.findOne({ github_username });

    if (!dev) {
      const response = await axios.get(
        `http://api.github.com/users/${github_username}`
      );

      const { name = login, avatar_url, bio } = response.data;
      const techsArr = parseStringAsArray(techs);

      const location = {
        type: "Point",
        coordinates: [longitude, latitude]
      };

      dev = await Dev.create({
        name,
        github_username,
        avatar_url,
        bio,
        techs: techsArr,
        location
      });

      // Filtrar conexões que estão a no máximo 10km de distancia
      // e que o novo dev tenha pelo menos uma das tecnologias filtradas
      const sendSocketMessageTo = findConnections(
        { latitude, longitude },
        techsArr
      );

      sendMessage(sendSocketMessageTo, "new-dev", dev);
    }

    return res.json(dev);
  }
};
