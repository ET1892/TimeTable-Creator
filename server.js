const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const path = require('path');

const uri = "mongodb+srv://ethant35:26e8K0kcytI3CeM3@cluster35.f0nda9e.mongodb.net/mydb";
const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
  }
}

connectToDatabase();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the "public" directory

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});






// Create a new student
app.post('/students', async (req, res) => {
    try {
      const { title, firstName, lastName, phoneNumber, email, addressLine1, addressLine2, town, county, eircode, birthday, gender, virtualTutorial, parentGuardian, subject } = req.body;
  
      // Check if all required fields are present
      if (!title || !firstName || !lastName || !phoneNumber || !email || !addressLine1 || !town || !county || !eircode || !birthday || !gender || !subject) {
        throw new Error('Incomplete student data');
      }
  
      const student = {
        title, // Add title field
        firstName,
        lastName,
        phoneNumber,
        email,
        address: {
          line1: addressLine1,
          ...(addressLine2 && { line2: addressLine2 }), // Make addressLine2 optional
          town,
          county,
          eircode
        },
        birthday,
        gender,
        virtualTutorial: Boolean(virtualTutorial), // Convert virtualTutorial to boolean
        parentGuardian,
        subject, // Add subject field
        creationDate: new Date() // Add creationDate field with current date
      };
  
      const isUnder18 = (date) => {
        const currentDate = new Date();
        const birthDate = new Date(date);
        const age = currentDate.getFullYear() - birthDate.getFullYear();
        const monthDiff = currentDate.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
          return age - 1;
        }
        return age;
      };
  
      if (isUnder18(birthday) < 18 && !parentGuardian) {
        throw new Error('Parent/Guardian needed for student under 18');
      }
  
      const collection = client.db('mydb').collection('students');
      const result = await collection.insertOne(student);
  
      if (result && result.insertedCount === 1) {
        console.log('Student created:', result.ops[0]);
        res.json(result.ops[0]);
      } else {
        console.error('Successfully created student');
        res.status(500).send('Successfully created student');
      }
    } catch (error) {
      console.error('Failed to create student:', error.message);
      res.status(500).json({ error: 'Failed to create student', message: error.message });
    }
  });
  
  
  
  
  
  
  

  
  
  
  
  
  
  
  
  
  



  

// Get all students
app.get('/students', async (req, res) => {
    try {
      const collection = client.db('mydb').collection('students');
      const students = await collection.find().toArray();
      res.json(students);
      console.log('All students retrieved successfully');
    } catch (error) {
      console.error('Failed to fetch students', error);
      res.status(500).send('Failed to fetch students');
    }
  });
  









// Get a student by ID
app.get('/students/:id', async (req, res) => {
    try {
      const collection = client.db('mydb').collection('students');
      const student = await collection.findOne({ _id: new ObjectId(req.params.id) });
      if (student) {
        res.json(student);
        console.log('Student retrieved successfully');
      } else {
        res.status(404).send('Student not found');
      }
    } catch (error) {
      console.error('Failed to fetch student', error);
      res.status(500).send('Failed to fetch student');
    }
  });
  







// Update a student by ID
app.put('/students/:id', async (req, res) => {
    try {
      const { addressLine1, addressLine2, town, county, ...updatedStudentData } = req.body;
  
      const collection = client.db('mydb').collection('students');
      const result = await collection.updateOne(
        { _id: new ObjectId(req.params.id) },
        {
          $set: {
            ...updatedStudentData,
            address: {
              line1: addressLine1,
              line2: addressLine2,
              town,
              county
            }
          }
        }
      );
      if (result.modifiedCount === 1) {
        res.status(200).send('Student updated successfully');
      } else {
        res.status(404).send('Student not found');
      }
    } catch (error) {
      console.error('Failed to update student', error);
      res.status(500).send('Failed to update student');
    }
  });
  

  






// Delete all students
app.delete('/students', async (req, res) => {
    try {
      const collection = client.db('mydb').collection('students');
      const result = await collection.deleteMany({});
      if (result.deletedCount > 0) {
        res.status(200).send('All students deleted successfully');
      } else {
        res.status(404).send('No students found');
      }
    } catch (error) {
      console.error('Failed to delete students', error);
      res.status(500).send('Failed to delete students');
    }
  });
  







// Delete a student by ID
app.delete('/students/:id', async (req, res) => {
    try {
      const studentId = req.params.id;
      const objectId = new ObjectId(studentId);
      const collection = client.db('mydb').collection('students');
      const result = await collection.deleteOne({ _id: objectId });
      if (result.deletedCount === 1) {
        res.status(200).send('Student deleted successfully');
      } else {
        res.status(404).send('Student not found');
      }
    } catch (error) {
      console.error('Failed to delete student', error);
      res.status(500).send('Failed to delete student');
    }
  });
  
















//crud for tutors
//create Tutor
app.post('/tutors', async (req, res) => {
    try {
      const { title, firstName, lastName, phoneNumber, email, address } = req.body;
  
      // Check if all required fields are present
      if (!title || !firstName || !lastName || !phoneNumber || !email || !address || !address.line1 || !address.town || !address.county || !address.eircode) {
        throw new Error('Incomplete tutor data');
      }
  
      // Validate email format using a regular expression
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }
  
      const tutor = {
        title,
        firstName,
        lastName,
        phoneNumber,
        email,
        address: {
          line1: address.line1,
          line2: address.line2 || '', // Optional: Set line2 to an empty string if it's not provided
          town: address.town,
          county: address.county,
          eircode: address.eircode
        }
      };
  
      const collection = client.db('mydb').collection('tutors');
      const result = await collection.insertOne(tutor);
  
      if (result && result.insertedCount === 1) {
        console.log('Tutor created:', result.ops[0]);
        res.json(result.ops[0]);
      } else {
        console.error('Successfully created tutor');
        res.status(500).send('Successfully created tutor');
      }
    } catch (error) {
      console.error('Failed to create tutor:', error.message);
      res.status(500).send('Failed to create tutor: ' + error.message);
    }
  });
  
  
  






  
  




  
// Update a tutor by ID
app.put('/tutors/:id', async (req, res) => {
    try {
      const collection = client.db('mydb').collection('tutors');
      const result = await collection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body }
      );
      if (result.modifiedCount === 1) {
        res.status(200).send('Tutor updated successfully');
      } else {
        res.status(404).send('Tutor not found');
      }
    } catch (error) {
      console.error('Failed to update tutor', error);
      res.status(500).send('Failed to update tutor');
    }
  });
  
  
  
  
  



  
  // Delete a tutor by ID
  app.delete('/tutors/:id', async (req, res) => {
    try {
      const tutorId = req.params.id;
      const objectId = new ObjectId(tutorId);
      const collection = client.db('mydb').collection('tutors');
      const result = await collection.deleteOne({ _id: objectId });
      if (result.deletedCount === 1) {
        res.status(200).send('Tutor deleted successfully');
      } else {
        res.status(404).send('Tutor not found');
      }
    } catch (error) {
      console.error('Failed to delete tutor', error);
      res.status(500).send('Failed to delete tutor');
    }
  });
  
  

  // Delete all tutors
  app.delete('/tutors', async (req, res) => {
    try {
      const collection = client.db('mydb').collection('tutors');
      const result = await collection.deleteMany({});
      res.status(200).send('All tutors deleted successfully');
    } catch (error) {
      console.error('Failed to delete tutors', error);
      res.status(500).send('Failed to delete tutors');
    }
  });





// Get all tutors
app.get('/tutors', async (req, res) => {
    try {
      const collection = client.db('mydb').collection('tutors');
      const tutors = await collection.find().toArray();
      res.status(200).json(tutors); // Send the tutor data as the response
    } catch (error) {
      console.error('Failed to fetch tutors', error);
      res.status(500).send('Failed to fetch tutors');
    }
  });
  
  

  




  // Get a tutor by ID
  app.get('/tutors/:id', async (req, res) => {
    try {
      const collection = client.db('mydb').collection('tutors');
      const tutor = await collection.findOne({ _id: new ObjectId(req.params.id) });
      if (tutor) {
        res.status(200).send('Tutor retrieved successfully');
      } else {
        res.status(404).send('Tutor not found');
      }
    } catch (error) {
      console.error('Failed to fetch tutor', error);
      res.status(500).send('Failed to fetch tutor');
    }
  });
  
  






//tutorial

  
  
// Create a new tutorial
app.post('/tutorials', async (req, res) => {
    try {
      const { date, time, students, tutor, fee, tutorialNumber, attendance, subject, notes } = req.body;
  
      console.log('Received tutorial data:', req.body);
  
      // Check if all required fields are present
      if (!date || !time || !students || !fee || !tutorialNumber || !attendance || !subject) {
        throw new Error('Incomplete tutorial data');
      }
  
      // Check the number of students
      console.log('Number of students:', students.length);
      if (students.length < 1 || students.length > 5) {
        throw new Error('Invalid number of students. Minimum 1 student and maximum 5 students are allowed.');
      }
  
      // Check the number of tutors
      if (!tutor || Array.isArray(tutor) || tutor.trim() === '') {
        throw new Error('Invalid number of tutors. Only one tutor is required.');
      }
  
      const tutorial = {
        date,
        time,
        students,
        tutor,
        fee,
        tutorialNumber,
        attendance,
        subject,
        notes
      };
  
      const collection = client.db('mydb').collection('tutorials');
      const result = await collection.insertOne(tutorial);
  
      if (result && result.insertedCount === 1) {
        console.log('Tutorial created:', result.ops[0]);
        res.json(result.ops[0]);
      } else {
        console.error('Successfully created a tutorial');
        res.status(500).send('Successfully created a tutorial');
      }
    } catch (error) {
      console.error('Failed to create tutorial:', error.message);
      res.status(500).send('Failed to create tutorial: ' + error.message);
    }
  });
  
  
  






  
  // Update tutorial information
// Update a tutorial
app.put('/tutorials/:id', async (req, res) => {
    try {
      const tutorialId = req.params.id;
      const { date, time, students, tutor, fee, tutorialNumber, attendance, subject, notes } = req.body;
  
      // Check if all required fields are present
      if (!date || !time || !students || !fee || !tutorialNumber || !attendance || !subject) {
        throw new Error('Incomplete tutorial data');
      }
  
      // Check the number of students
      if (students.length < 1 || students.length > 5) {
        throw new Error('Invalid number of students. Minimum 1 student and maximum 5 students are allowed.');
      }
  
      // Check the number of tutors
      if (!tutor || Array.isArray(tutor) || tutor.trim() === '') {
        throw new Error('Invalid number of tutors. Only one tutor is required.');
      }
  
      const collection = client.db('mydb').collection('tutorials');
      const result = await collection.updateOne(
        { _id: ObjectId(tutorialId) },
        {
          $set: {
            date,
            time,
            students,
            tutor,
            fee,
            tutorialNumber,
            attendance,
            subject,
            notes
          }
        }
      );
  
      if (result && result.modifiedCount === 1) {
        console.log('Tutorial updated:', tutorialId);
        res.json({ message: 'Tutorial updated successfully' });
      } else {
        console.error('Failed to update tutorial:', tutorialId);
        res.status(500).send('Failed to update tutorial');
      }
    } catch (error) {
      console.error('Failed to update tutorial:', error.message);
      res.status(500).send('Failed to update tutorial: ' + error.message);
    }
  });
  
  









  // Retrieve all tutorials
app.get('/tutorials', async (req, res) => {
    try {
      const collection = client.db('mydb').collection('tutorials');
      const tutorials = await collection.find().toArray();
      res.status(200).json(tutorials);
    } catch (error) {
      console.error('Failed to fetch tutorials', error);
      res.status(500).send('Failed to fetch tutorials');
    }
  });
  








  
  


  // Delete all tutorials
app.delete('/tutorials', async (req, res) => {
    try {
      const collection = client.db('mydb').collection('tutorials');
      const result = await collection.deleteMany({});
  
      if (result && result.deletedCount > 0) {
        console.log('All tutorials deleted');
        res.status(200).send('All tutorials deleted');
      } else {
        console.error('No tutorials found');
        res.status(404).send('No tutorials found');
      }
    } catch (error) {
      console.error('Failed to delete tutorials:', error);
      res.status(500).send('Failed to delete tutorials');
    }
  });
  
  













// Serve static files from the "public" directory
app.use(express.static('public'));

// Serve index.html as the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});







// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
