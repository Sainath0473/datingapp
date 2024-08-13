const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

try {
    mongoose.connect('mongodb://localhost/datingapp', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected")

} catch (error)
{console.log(error)}

const Profile = mongoose.model('Profile', {
  name: String,
  age: Number,
  interests: [String],
  bio: String
});


app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    try {
        // Fetch all profiles from the database
        // const profiles = [
        //         { id: "1", name: "Alice" },
        //         { id: "2", name: "Bob" },
        //         { id: "3", name: "Charlie" }
        //     ];
        Profile.find({}).then(profiles => res.render('home', { title: 'Dating App', profiles: profiles.map(profile => profile.toJSON())}));

        

      } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).send('Error fetching profiles');
      }
});

app.get('/profile/new', (req, res) => {
  res.render('new-profile', { title: 'Create New Profile' });
});

app.post('/profile/new', async (req, res) => {
  const { name, age, interests, bio } = req.body;
  const profile = new Profile({ name, age, interests: interests.split(','), bio });
  await profile.save();
  res.redirect('/');
});

app.get('/profile/edit/:id', async (req, res) => {
    const profile = await Profile.findById(req.params.id)
    if (!profile) {
      return res.status(404).send('Profile not found');
    }
  
    // Convert interests array to a comma-separated string
    res.render('edit-profile', { title: 'Edit Profile', profile: profile.toJSON() });
  });
  

 // Update an existing profile
// Update an existing profile
app.post('/profile/edit/:id', async (req, res) => {
    console.log(`Updating profile with ID: ${req.params.id}`);
    const { name, age, interests, bio } = req.body;
    try {
      await Profile.findByIdAndUpdate(req.params.id, {
        name,
        age,
        interests: interests.split(','),
        bio
      });
      res.redirect('/');
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).send('Error updating profile');
    }
  });
  


  app.get('/profiles', async (req, res) => {
    try {
      // Fetch all profiles from the database
      const profiles = await Profile.find();
  
      // Send the profiles data as JSON response
      res.json(profiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      res.status(500).send('Error fetching profiles');
    }
  });

  app.get('/profiles/:id', async (req, res) => {
    try {
      // Extract ID from request parameters
      const { id } = req.params;
      
      // Fetch the profile from the database using Mongoose
      const profile = await Profile.findById(id);
  
      // Check if profile was found
      if (!profile) {
        return res.status(404).send('Profile not found');
      }
  
      // Send the profile data as JSON response
      res.json(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).send('Error fetching profile');
    }
  });


  

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});