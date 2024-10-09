const express = require("express");
const router = express.Router();
const axios = require("axios");
const User = require("../models/User");

router.post("/", async (req, res) => {
  try {
    const { name, age, gender, phone, email } = req.body;
    console.log("Received data:", { name, age, gender, phone, email });

    // Fetch IP-based location
    let city, country;
    try {
      console.log("Attempting to fetch IP data...");
      const ipResponse = await axios.get(
        "https://webhook.site/4388f18c-41d2-4d73-8d08-65c46ac2368c",
        {
          timeout: 5000, // 5 seconds timeout
        }
      );
      console.log("IP response:", ipResponse.data);
      const locationParts = ipResponse.data.location.split(", ");
      city = locationParts[0];
      country = locationParts[1];
    } catch (error) {
      console.error(
        "Error fetching IP data, using fallback values:",
        error.message
      );
      city = "Default City";
      country = "Default Country";
    }

    // Fetch weather data
    let temperature, weatherCondition;
    try {
      console.log("Attempting to fetch weather data...");
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`,
        {
          timeout: 5000, // 5 seconds timeout
        }
      );
      console.log("Weather response:", weatherResponse.data);
      temperature = weatherResponse.data.main.temp;
      weatherCondition = weatherResponse.data.weather[0].main;
    } catch (error) {
      console.error(
        "Error fetching weather data, using fallback values:",
        error.message
      );
      temperature = 0;
      weatherCondition = "Unknown";
    }

    const user = new User({
      name,
      age,
      gender,
      phone,
      email,
      address: { city, country },
      weather: { temperature, condition: weatherCondition },
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error("Error in POST /api/users:", error.message);
    console.error("Error stack:", error.stack);
    res.status(400).json({ message: error.message, stack: error.stack });
  }
});

// Read all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// Update user
// Update user
router.put('/:id', async (req, res) => {
    try {
      const { name, age, gender, phone, email } = req.body;
  
      // Find the existing user
      const existingUser = await User.findById(req.params.id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Prepare update object with only the fields that are provided
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (age !== undefined) updateData.age = age;
      if (gender !== undefined) updateData.gender = gender;
      if (phone !== undefined) updateData.phone = phone;
      if (email !== undefined) updateData.email = email;
  
      // Only fetch new location and weather if any user details have changed
      if (Object.keys(updateData).length > 0) {
        // Fetch IP-based location
        try {
          const ipResponse = await axios.get('https://webhook.site/4388f18c-41d2-4d73-8d08-65c46ac2368c', {
            timeout: 5000
          });
          const locationParts = ipResponse.data.location.split(', ');
          updateData['address.city'] = locationParts[0];
          updateData['address.country'] = locationParts[1];
        } catch (error) {
          console.error("Error fetching IP data, using existing values:", error.message);
        }
  
        // Fetch weather data
        try {
          const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${updateData['address.city'] || existingUser.address.city}&appid=${process.env.WEATHER_API_KEY}&units=metric`, {
            timeout: 5000
          });
          updateData['weather.temperature'] = weatherResponse.data.main.temp;
          updateData['weather.condition'] = weatherResponse.data.weather[0].main;
        } catch (error) {
          console.error("Error fetching weather data, using existing values:", error.message);
        }
      }
  
      // Update the user with only the changed fields
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      );
  
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error.message);
      res.status(400).json({ message: error.message });
    }
  });

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
