const express = require('express');
const morgan = require('morgan');
const mongoose =  require('mongoose'); 
const result = require('lodash');
const { render } = require('ejs');
const Ug = require('./models/ug');
const path = require('path');
const Admin = require('./models/adminlogin');
const multer = require('multer');
const Module = require('./models/module');
const fs = require('fs');
const session = require('express-session');
const Ann = require('./models/announcement');
// const router = express.Router();

const app = express();

// connect to mongodb
const dbURI = 'mongodb+srv://user-sxsa:Asus2016sjp.@cluster0.fuubarr.mongodb.net/inPATH-db?retryWrites=true&w=majority';
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => app.listen(3000))
    .catch((err) => console.log(err));

// register view engine
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(express.urlencoded({extended: true})); 

app.use(morgan('dev')); 

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/loginadmin', (req, res) => {
    res.render('loginadmin');
});

app.get('/signupadmin', (req, res) => {
    res.render('signupadmin');
});



// app.get('/home', (req, res) => {
//   const imagePath = '/bg.png'; // Adjust the path to your image file
//   res.render('home', { imagePath });
// });







// --------------------- used only save the user name and password ---------------

// app.post('/signupadmin', async(req, res) =>  {
//     const data = {
//         name: req.body.username,
//         password: req.body.password,
//     }

//     await Admin.insertMany([data]);

//     res.render('loginadmin')
// });


// Set up multer for file uploads
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads-admin');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const fileUploader = multer({ storage: fileStorage });



// Handle the form submission
app.post('/signupadmin', fileUploader.single('profilePicture'), async (req, res) => {
  const { username, password, fullName, acq } = req.body;
  const profilePicture = req.file;

  try {
    // Create a new instance of the Admin model
    const newAdmin = new Admin({
      username,
      password,
      fn: fullName,
      acq,
      propic: profilePicture ? profilePicture.path : 'uploads/default_propic.png'
    });

    // Save the new instance to the database
    await newAdmin.save();

    res.redirect('/loginadmin'); // Example: redirect to login page
  } catch (error) {
    console.error(error);
    return res.status(500).send('An error occurred during signup.');
  }
});



app.post('/loginadmin', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the admin by username and password
    const admin = await Admin.findOne({ username, password });

    if (admin) {
      // Admin login successful, render index.ejs
      res.render('index', {admin});
    } else {
      // Invalid credentials, display error message
      res.send('Invalid username or password');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred during login.');
  }
});

// app.get('/index', (req, res) => {
//   // Render the index.ejs page
//   res.render('index');
// });

app.get('/index/:adminId', async (req, res) => {
  const adminId = req.params.adminId;

  try {
    // Find the admin in the database based on the provided admin ID
    const admin = await Admin.findById(adminId);

    if (admin) {
      // Render the profile.ejs file and pass the admin details as a variable
      res.render('index', { admin });
    } else {
      // Handle admin not found, e.g., show an error message
      res.send('Admin not found');
    }
  } catch (error) {
    // Handle any errors that occur during the database query
    res.send('An error occurred');
  }
});


// app.post('/index', (req, res) => {
//     const ug = new Ug(req.body);
//     ug.save()
//         .then((result) => {
//             res.render('index');
//         })
//         .catch((err) => {
//             console.log(err);
//         })
// });

app.post('/enroll', (req, res) => {
    const ug = new Ug(req.body);
    ug.save()
      .then((result) => {
        res.render('enroll');
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.get('/enroll', (req, res) => {
    res.render('enroll');
});

app.get('/allocatedesks', (req, res) => {
    res.render('allocatedesks');
});

app.post('/allocatedesks', async (req, res) => {
    const upperLimit = parseInt(req.body.upperlimit);
    const lowerLimit = parseInt(req.body.lowerlimit);
  
    // Validate the upper and lower limits
    if (isNaN(upperLimit) || isNaN(lowerLimit)) {
      return res.status(400).send('Invalid input. Please enter valid numbers.');
    }
  
    try {
      // Fetch all documents from the "ugs" collection
      const Ug = mongoose.model('Ug');
      const documents = await Ug.find();
  
      // Update each document with a random desk number between the limits
      for (let i = 0; i < documents.length; i++) {
        const randomDeskNo = Math.floor(Math.random() * (upperLimit - lowerLimit + 1)) + lowerLimit;
        documents[i].desk_no = randomDeskNo;
        await documents[i].save();
      }
  
      console.log('Desk numbers updated successfully.');
  
      // Redirect to a success page or send a response back to the client
    //   res.send('Desk numbers updated successfully.');
        res.render('allocatedesks', { successMessage: 'Desk numbers updated successfully.' });   
    } catch (error) {
      console.error('Error updating desk numbers:', error);
      res.status(500).send('An error occurred while updating desk numbers.');
    }
  });

  app.get('/loginuser', (req, res) => {
    res.render('loginuser');
});

app.get('/signupuser', (req, res) => {
    res.render('signupuser');
});

// const upload = multer({ dest: 'uploads/' });

// app.post('/signupuser', upload.single('propic'), async (req, res) => {
//   const regnum = req.body.regnum;
//   const password = req.body.password;
//   const propic = req.file.filename; // The uploaded file is available as req.file

//   try {
//     // Find the user document by regnum
//     const user = await Ug.findOne({ regnum });

//     if (!user) {
//       // Handle case when user is not found
//       return res.send('User not found');
//     }

//     // Update the user document with the new password and propic
//     user.password = password;
//     user.propic = propic;

//     await user.save();

//     // Redirect or send a response indicating success
//     res.send('User updated successfully');
//   } catch (error) {
//     // Handle any errors that occur during the update process
//     console.error(error);
//     res.send('An error occurred');
//   }
// });




// when using this code pro pic name and the type of the pro pic is changed



// const fileUpload = multer({ dest: 'images/' });

// app.post('/signupuser', fileUpload.single('propic'), async (req, res) => {
//   const regnum = req.body.regnum;
//   const password = req.body.password;
//   const propic = 'images/' + req.file.filename; // The uploaded file is available as req.file

//   try {
//     // Find the user document by regnum
//     const user = await Ug.findOne({ regnum });

//     if (!user) {
//       // Handle case when user is not found
//       return res.send('User not found');
//     }

//     // Update the user document with the new password and propic
//     user.password = password;
//     user.propic = propic;

//     await user.save();

//     // Redirect or send a response indicating success
//     res.send('User updated successfully');
//   } catch (error) {
//     // Handle any errors that occur during the update process
//     console.error(error);
//     res.send('An error occurred');
//   }
// });


// ------------working code for update pro pic--------------------------

// const fileUpload = multer({ dest: 'uploads/' });

// app.post('/signupuser', fileUpload.single('propic'), async (req, res) => {
//   const regnum = req.body.regnum;
//   const password = req.body.password;
//   let propic = '';

//   if (req.file) {
//     const allowedFileTypes = ['image/jpeg', 'image/png']; // Add other allowed file types as needed

//     if (!allowedFileTypes.includes(req.file.mimetype)) {
//       return res.send('Invalid file type. Only JPEG and PNG files are allowed.');
//     }

//     // Rename the file to its original name with the original extension
//     const originalFileName = req.file.originalname;
//     const fileExtension = originalFileName.substring(originalFileName.lastIndexOf('.'));
//     const newFileName = req.file.filename + fileExtension;

//     // Move the file to the new directory with the new name
//     fs.renameSync(req.file.path, 'uploads/' + newFileName);

//     propic = 'uploads/' + newFileName;
//   }

//   try {
//     // Find the user document by regnum
//     const user = await Ug.findOne({ regnum });

//     if (!user) {
//       // Handle case when user is not found
//       return res.send('User not found');
//     }

//     // Update the user document with the new password and propic
//     user.password = password;
//     user.propic = propic;

//     await user.save();

//     // Redirect or send a response indicating success
//     res.send('User updated successfully');
//   } catch (error) {
//     // Handle any errors that occur during the update process
//     console.error(error);
//     res.send('An error occurred');
//   }
// });


// -------------------------- propic is updated without name changes (01) --------------------------- 

// const fileUpload = multer({ dest: 'uploads/' });

// app.post('/signupuser', fileUpload.single('propic'), async (req, res) => {
//   const regnum = req.body.regnum;
//   const password = req.body.password;
//   let propic = '';

//   if (req.file) {
//     const allowedFileTypes = ['image/jpeg', 'image/png']; // Add other allowed file types as needed

//     if (!allowedFileTypes.includes(req.file.mimetype)) {
//       return res.send('Invalid file type. Only JPEG and PNG files are allowed.');
//     }

//     // Store the original file name with extension
//     const originalFileName = req.file.originalname;
    
//     // Move the file to the new directory with the original name
//     const newFilePath = '/uploads/' + originalFileName;
//     fs.renameSync(req.file.path, newFilePath);

//     propic = newFilePath;
//   }

//   try {
//     // Find the user document by regnum
//     const user = await Ug.findOne({ regnum });

//     if (!user) {
//       // Handle case when user is not found
//       return res.send('User not found');
//     }

//     // Update the user document with the new password and propic
//     user.password = password;
//     user.propic = propic;

//     await user.save();

//     // Redirect or send a response indicating success
//     res.send('User updated successfully');
//   } catch (error) {
//     // Handle any errors that occur during the update process
//     console.error(error);
//     res.send('An error occurred');
//   }
// });

// -------------------------- propic is updated without name changes (02 - After solve the bug related to dows not show the propic) ---------------------------

const fileUpload = multer({ dest: 'uploads/' });

app.post('/signupuser', fileUpload.single('propic'), async (req, res) => {
  const regnum = req.body.regnum;
  const password = req.body.password;
  let propic = '';

  if (req.file) {
    const allowedFileTypes = ['image/jpeg', 'image/png']; // Add other allowed file types as needed

    if (!allowedFileTypes.includes(req.file.mimetype)) {
      return res.send('Invalid file type. Only JPEG and PNG files are allowed.');
    }

    // Store the original file name with extension
    const originalFileName = req.file.originalname;

    // Move the file to the new directory with the original name
    const newFilePath = 'uploads/' + originalFileName;
    fs.renameSync(req.file.path, newFilePath);

    propic = '/' + newFilePath; // Update the propic path to include a leading slash
  }

  try {
    // Find the user document by regnum
    const user = await Ug.findOne({ regnum });

    if (!user) {
      // Handle case when user is not found
      return res.send('User not found');
    }

    // Update the user document with the new password and propic
    user.password = password;
    user.propic = propic;

    await user.save();

    // Redirect or send a response indicating success
    res.send('User updated successfully');
  } catch (error) {
    // Handle any errors that occur during the update process
    console.error(error);
    res.send('An error occurred');
  }
});



// app.post('/signupuser', async (req, res) => {
//     const { regnum, password } = req.body;
    
//     try {
//       // Find the relevant document based on the registration number
//       const ug = await Ug.findOne({ regnum });
  
//       // Update the password field of the found document
//       ug.password = password;
  
//       // Save the updated document
//       await ug.save();
  
//     //   res.send('User signed up successfully!');
//       res.render('loginuser')
//     } catch (error) {
//       console.error('Error during sign up:', error);
//       res.status(500).send('An error occurred during sign up.');
//     }
//   });

app.get('/loginuser', (req, res) => {
    res.render('loginuser');

});

// app.get('/profile', (req, res) => {
//   res.render('profile');
// });

app.get('/profile', (req, res) => {
  res.render('profile');
});


app.get('/test', (req, res) => {
  res.render('test');
});

app.get('/exams', (req, res) => {
  res.render('exams');
});

app.post('/loginuser', async (req, res) => {
  const { regnum, password } = req.body;

  try {
    // Find the document with the matching registration number and password
    const user = await Ug.findOne({ regnum, password });

    if (user) {
      // Render the 'profile' page and pass the 'user' object as data
      res.render('profile', { user });
    } else {
      // Render an error page or redirect to a login failure route
      res.render('error'); // Replace 'error' with the name of your error page
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('An error occurred during login.');
  }
});

app.get('/profile/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Find the user in the database based on the provided user ID
    const user = await Ug.findById(userId);

    if (user) {
      // Render the profile.ejs file and pass the user details as a variable
      res.render('profile', { user });
    } else {
      // Handle user not found, e.g., show an error message
      res.send('User not found');
    }
  } catch (error) {
    // Handle any errors that occur during the database query
    res.send('An error occurred');
  }
});

// ------------------------ begins exams pageee ------------------------------


// --------01) 1st try ------------------------

// app.get('/exams', async (req, res) => {
//   const moduleName = req.query.moduleName;

//   if (!moduleName) {
//     return res.render('exams', { errorMessage: null, pdfUrl: null });
//   }

//   try {
//     const module = await Module.findOne({ moduleName });

//     if (module) {
//       const pdfUrl = module.resultSheet;
//       return res.render('exams', { errorMessage: null, pdfUrl });
//     } else {
//       return res.render('exams', { errorMessage: 'Enter correct module name', pdfUrl: null });
//     }
//   } catch (err) {
//     // Handle error
//     console.error(err);
//     return res.render('exams', { errorMessage: 'Error occurred', pdfUrl: null });
//   }
// });

// app.get('/exams/:userId', async (req, res) => {
//   const userId = req.params.userId;

//   try {
//     // Find the user in the database based on the provided user ID
//     const user = await Ug.findById(userId);

//     if (user) {
//       // Render the profile.ejs file and pass the user details as a variable
//       res.render('exams', { user });
//     } else {
//       // Handle user not found, e.g., show an error message
//       res.send('User not found');
//     }
//   } catch (error) {
//     // Handle any errors that occur during the database query
//     res.send('An error occurred');
//   }
// });

// ------------------- 2nd try ---

// app.get('/exams', async (req, res) => {
//   const moduleName = req.query.moduleName;
//   const userId = req.query.userId;

//   try {
//     let pdfUrl = null;

//     if (moduleName) {
//       const module = await Module.findOne({ moduleName });

//       if (module) {
//         pdfUrl = module.resultSheet;
//       } else {
//         return res.render('exams', { errorMessage: 'Enter correct module name', pdfUrl });
//       }
//     } else if (userId) {
//       const user = await Ug.findById(userId);

//       if (user) {
//         return res.render('exams', { user, errorMessage: null, pdfUrl });
//       } else {
//         return res.send('User not found');
//       }
//     }

//     return res.render('exams', { errorMessage: null, pdfUrl });
//   } catch (err) {
//     console.error(err);
//     return res.render('exams', { errorMessage: 'Error occurred', pdfUrl });
//   }
// });


// app.get('/exams/:userId', async (req, res) => {
//   const userId = req.params.userId;

//   try {
//     const user = await Ug.findById(userId);

//     if (user) {
//       return res.render('exams', { user, errorMessage: null });
//     } else {
//       return res.send('User not found');
//     }
//   } catch (error) {
//     console.error(error);
//     return res.send('An error occurred');
//   }
// });


// ------------------- 3rd try ----------------------------------

// Assuming you have a route handler for the /exams endpoint
// app.get('/exams/:userId', (req, res) => {
//   const userId = req.params.userId;

//   // Retrieve the user from the database based on the userId
//   Ug.findById(userId)
//     .then(user => {
//       // Pass the desk_no value and the user object to the exams.ejs view
//       res.render('exams', { desk_no: user.desk_no, user: user });
//     })
//     .catch(err => {
//       // Handle any errors
//       console.error(err);
//       res.status(500).send('Internal Server Error');
//     });
// });

app.get('/exams/:userId', (req, res) => {
  const userId = req.params.userId;

  // Retrieve the user from the database based on the userId
  Ug.findById(userId)
    .then(user => {
      // Render the exams.ejs view and pass the desk_no value, user object, and moduleNotFound flag
      res.render('exams', { desk_no: user.desk_no, user: user, moduleNotFound: false });
    })
    .catch(err => {
      // Handle any errors
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});

// ------------------ working well (download the pdf file)

// app.post('/exams/:userId/result', (req, res) => {
//   const userId = req.params.userId;
//   const moduleName = req.body.moduleName;

//   // Retrieve the user from the database based on the userId
//   Ug.findById(userId)
//     .then(user => {
//       // Find the module with the given moduleName for the user
//       Module.findOne({ moduleName: moduleName })
//         .then(module => {
//           if (!module) {
//             // If the module is not found, return an error
//             return res.render('exams', { desk_no: user.desk_no, user: user, moduleNotFound: true });
//           }

//           // Read the resultSheet file as a stream
//           const fileStream = fs.createReadStream(module.resultSheet);

//           // Set the appropriate headers for PDF file download
//           res.setHeader('Content-Type', 'application/pdf');
//           res.setHeader('Content-Disposition', 'attachment; filename=resultSheet.pdf');

//           // Pipe the file stream to the response
//           fileStream.pipe(res);
//         })
//         .catch(err => {
//           console.error(err);
//           res.status(500).send('Internal Server Error');
//         });
//     })
//     .catch(err => {
//       // Handle any errors
//       console.error(err);
//       res.status(500).send('Internal Server Error');
//     });
// });

// ------------------------- open in a another tab -------------------

// app.post('/exams/:userId/result', (req, res) => {
//   const userId = req.params.userId;
//   const moduleName = req.body.moduleName;

//   // Retrieve the user from the database based on the userId
//   Ug.findById(userId)
//     .then(user => {
//       // Find the module with the given moduleName for the user
//       Module.findOne({ moduleName: moduleName })
//         .then(module => {
//           if (!module) {
//             // If the module is not found, return an error
//             return res.render('exams', { desk_no: user.desk_no, user: user, moduleNotFound: true });
//           }

//           // Read the resultSheet file as a stream
//           const fileStream = fs.createReadStream(module.resultSheet);

//           // Set the appropriate header for PDF display in the browser
//           res.setHeader('Content-Type', 'application/pdf');

//           // Pipe the file stream to the response
//           fileStream.pipe(res);
//         })
//         .catch(err => {
//           console.error(err);
//           res.status(500).send('Internal Server Error');
//         });
//     })
//     .catch(err => {
//       // Handle any errors
//       console.error(err);
//       res.status(500).send('Internal Server Error');
//     });
// });




app.post('/exams/:userId/result', (req, res) => {
  const userId = req.params.userId;
  const moduleName = req.body.moduleName;

  // Retrieve the user from the database based on the userId
  Ug.findById(userId)
    .then(user => {
      // Find the module with the given moduleName for the user
      Module.findOne({ moduleName: moduleName })
        .then(module => {
          if (!module) {
            // If the module is not found, return an error
            return res.render('exams', { desk_no: user.desk_no, user: user, moduleNotFound: true });
          }

          // Read the resultSheet file as a stream
          const fileStream = fs.createReadStream(module.resultSheet);

          // Set the appropriate header for PDF display in the browser
          res.setHeader('Content-Type', 'application/pdf');

          // Pipe the file stream to the response
          fileStream.pipe(res);
        })
        .catch(err => {
          console.error(err);
          res.status(500).send('Internal Server Error');
        });
    })
    .catch(err => {
      // Handle any errors
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});









// new code 20/06/2023

// Route for handling login form submission






// app.post('/loginuser', async (req, res) => {
//   const { regnum, password } = req.body;

//   try {
//     // Find the document with the matching registration number and password
//     const user = await Ug.findOne({ regnum, password });

//     if (user) {
//       // Render the 'profile' page and pass the 'user' object as data
//       res.render('test', { user: user.toObject() });
//     } else {
//       // Render an error page or redirect to a login failure route
//       res.render('error'); // Replace 'error' with the name of your error page
//     }
//   } catch (error) {
//     console.error('Error during login:', error);
//     res.status(500).send('An error occurred during login.');
//   }
// });




// -------------------- Used to login -----------------


// ----------------------- 01) --------------------


// app.post('/loginuser', async (req, res) => {
//     const { regnum, password } = req.body;
  
//     try {
//       // Find the document with the matching registration number and password
//       const user = await Ug.findOne({ regnum, password });
  
//       if (user) {
//         // Render a success page or redirect to a different route
//         res.render('profile', {user}); // Replace 'success' with the name of your success page
//       } else {
//         // Render an error page or redirect to a login failure route
//         res.render('error'); // Replace 'error' with the name of your error page
//       }
//     } catch (error) {
//       console.error('Error during login:', error);
//       res.status(500).send('An error occurred during login.');
//     }
//   });

// app.get('/profile', (req, res) => {
//   // Render the profile page without passing any data
//   res.render('profile');
// });


// -------------------------------- 02) ----------------------------------

// app.post('/loginuser', async (req, res) => {
//   const { regnum, password } = req.body;

//   try {
//     // Find the document with the matching registration number and password
//     const user = await Ug.findOne({ regnum, password });

//     if (user) {
//       // Render the profile page and pass the user object
//       return res.render('profile', { user, currentPage: 'profile' });
//     } else {
//       // Render an error page or redirect to a login failure route
//       return res.render('error'); // Replace 'error' with the name of your error page
//     }
//   } catch (error) {
//     console.error('Error during login:', error);
//     return res.status(500).send('An error occurred during login.');
//   }
// });


// app.get('/profile', (req, res) => {
//   // Render the profile page and pass the currentPage value
//   res.render('profile', { currentPage: 'profile' });
// });


// app.get('/profile', (req, res) => {
//   // Set the currentPage value to 'profile'
//   res.render('profile', { currentPage: 'profile' });
// });

// app.get('/profile', (req, res) => {
//     res.render('profile');
// });

// ----------------------- Assign desks ------------------

// // In your server-side code

// // Handle the POST request for login
// app.post('/exams', async (req, res) => {
//   const { regnum, password } = req.body;

//   try {
//     // Find the document with the matching registration number and password
//     const user = await Ug.findOne({ regnum, password });

//     if (user) {
//       // Retrieve the desk number associated with the registration number
//       const desk_no = Ug.desk_no;

//       // Render the exams page and pass the desk number as a variable
//       res.render('exams', { desk_no: desk_no});
//     } else {
//       // Render an error page or redirect to a login failure route
//       res.render('error'); // Replace 'error' with the name of your error page
//     }
//   } catch (error) {
//     console.error('Error during login:', error);
//     res.status(500).send('An error occurred during login.');
//   }
// });

// // In your server-side code

// // Handle the POST request for login
// app.post('/exams', async (req, res) => {
//   const { regnum, password } = req.body;

//   try {
//     // Find the document with the matching registration number and password
//     const user = await Ug.findOne({ regnum, password });

//     if (user) {
//       // Retrieve the desk number associated with the user from the MongoDB collection
//       const deskNumber = Ug.desk_no;

//       // Render the exams page and pass the desk number as a variable
//       res.render('exams', { deskNumber: deskNumber });
//     } else {
//       // Render an error page or redirect to a login failure route
//       res.render('error');
//     }
//   } catch (error) {
//     console.error('Error during login:', error);
//     res.status(500).send('An error occurred during login.');
//   }
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/'); // store the files in the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Render the upload form 
app.get('/uploadresults', (req, res) => {
  res.render('uploadresults');
});

app.post('/uploadresults', upload.single('resultsheet'), async (req, res) => {
  try {
    const { moduleName } = req.body;
    const resultSheet = req.file.path;

    // Create a new module document
    await Module.create({ moduleName, resultSheet });

    res.redirect('/uploadresults'); // redirect to the upload form
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while uploading the result sheet.');
  }
});

app.post('/signupuser', upload.single('propic'), (req, res) => {
  // Access the uploaded file using req.file
  if (req.file) {
    // Save the file path to the propic field in the database
    // Assuming you have already established a connection to the database and imported the Ug model
    const propicPath = req.file.path;
    // Update the user's propic field with the file path
    Ug.findOneAndUpdate({ regnum: req.body.regnum }, { propic: propicPath }, (err, user) => {
      if (err) {
        console.error(err);
        // Handle the error case
      } else {
        // User updated successfully
        // Redirect or respond as needed
        console.log('User created successfully');
      }
    });
  } else {
    // No file uploaded, handle the case if necessary
    console.error('No file uploaded');
  }
});

const upload1 = multer({ dest: 'uploads/' });

// app.post('/signupuser', upload1.single('propic'), (req, res) => {
//   // Create a new user object with the provided regnum
//   const newUser = new Ug({
//     regnum: req.body.regnum,
//   });

//   // Check if password is provided and update the newUser object
//   if (req.body.password) {
//     newUser.password = req.body.password;
//   }

//   // Check if propic file is uploaded and update the newUser object
//   if (req.file) {
//     newUser.propic = req.file.path;
//   }

//   // Save the user object to the database
//   newUser.save()
//     .then(() => {
//       res.send('User signed up successfully!');
//     })
//     .catch((error) => {
//       console.error('Failed to sign up user:', error);
//       res.status(500).send('Error during sign up');
//     });
// });

// app.post('/signupuser', upload1.single('propic'), (req, res) => {
//   // Create a new user object with the provided regnum
//   const newUser = new Ug({
//     regnum: req.body.regnum,
//   });

//   // Check if password is provided and update the newUser object
//   if (req.body.hasOwnProperty('password')) {
//     newUser.password = req.body.password;
//   }

//   // Check if propic file is uploaded and update the newUser object
//   if (req.file) {
//     newUser.propic = req.file.path;
//   }

//   // Save the user object to the database
//   newUser.save()
//     .then(() => {
//       res.send('User signed up successfully!');
//     })
//     .catch((error) => {
//       console.error('Failed to sign up user:', error);
//       res.status(500).send('Error during sign up');
//     });
// });


// ------------------- WORKS WELL UNTILL THIS POINT --------------------


// app.get('/exams', async (req, res) => {
//   const moduleName = req.query.moduleName;

//   if (!moduleName) {
//     return res.render('exams', { errorMessage: null, pdfUrl: null });
//   }

//   try {
//     const module = await Module.findOne({ moduleName });

//     if (module) {
//       const pdfUrl = module.resultSheet;
//       return res.render('exams', { errorMessage: null, pdfUrl });
//     } else {
//       return res.render('exams', { errorMessage: 'Enter correct module name', pdfUrl: null });
//     }
//   } catch (err) {
//     // Handle error
//     console.error(err);
//     return res.render('exams', { errorMessage: 'Error occurred', pdfUrl: null });
//   }
// });


// cerate a announcement

app.get('/announcements', (req, res) => {
  res.render('announcements');
});

// Set up Multer storage for file uploads
const storageAnn = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the folder where the files will be saved
  },
  filename: (req, file, cb) => {
    const fileName = Date.now() + path.extname(file.originalname);
    cb(null, fileName); // Set the file name to be the current timestamp + original extension
  },
});

// Create Multer upload middleware
const uploadAnn = multer({ storage: storageAnn });

// working without show the announcement titile

// Handle form submission
app.post('/announcements', uploadAnn.single('announcement'), async (req, res) => {
  const { title } = req.body;
  const announcementPath = req.file.path;

  // Create a new announcement document
  const newAnnouncement = new Ann({
    title: title,
    announcement: announcementPath,
  });

  try {
    // Save the announcement to the database
    await newAnnouncement.save();
    // Redirect or render a success page
    res.redirect('/announcements');
  } catch (err) {
    console.error('Error saving announcement:', err);
    // Handle the error appropriately (e.g., show an error page)
    res.status(500).send('An error occurred while saving the announcement.');
  }
});

// show announcements 

// app.get('/showann', (req, res) => {
//   res.render('showann');
// });


// app.get('/showann', async (req, res) => {
//   try {
//     // Fetch all announcements from the "anns" collection
//     const announcements = await ann.find().lean();
//     // Render the showann.ejs template with announcements data
//     res.render('showann.ejs', { announcements: announcements });
//   } catch (err) {
//     console.error('Error fetching announcements:', err);
//     // Handle the error appropriately (e.g., show an error page)
//     res.status(500).send('An error occurred while fetching the announcements.');
//   }
// });



// const Ann = require('./models/ann'); // Assuming your model file is in the models/ann.js file


// working correctly (nav bar error)
// app.get('/showann', async (req, res) => {
//   try {
//     const announcements = await Ann.find();
//     res.render('showann', { announcements });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Internal Server Error');
//   }
// });


app.get('/showann/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await Ug.findById(userId);
    const announcements = await Ann.find();

    if (user) {
      res.render('showann', { user, announcements });
    } else {
      res.send('User not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/showann/viewpdf/:announcementId', async (req, res) => {
  const announcementId = req.params.announcementId;

  try {
    // Retrieve the announcement based on its ID
    const announcement = await Ann.findById(announcementId);

    if (announcement) {
      // Get the file path of the PDF file
      const filePath = path.join(__dirname, announcement.announcement);

      // Check if the file exists
      if (fs.existsSync(filePath)) {
        // Set the appropriate headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="announcement.pdf"');

        // Send the PDF file
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.status(404).send('PDF file not found');
      }
    } else {
      res.status(404).send('Announcement not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/attend/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Retrieve the user based on the provided user ID
    const user = await Ug.findById(userId);

    if (user) {
      // Render the attend.ejs file and pass the user details as a variable
      res.render('attend', { user });
    } else {
      // Handle user not found, e.g., show an error message
      res.send('User not found');
    }
  } catch (error) {
    // Handle any errors that occur during the database query
    res.send('An error occurred');
  }
});

app.get('/pre/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Retrieve the user based on the provided user ID
    const user = await Ug.findById(userId);

    if (user) {
      // Render the attend.ejs file and pass the user details as a variable
      res.render('pre', { user });
    } else {
      // Handle user not found, e.g., show an error message
      res.send('User not found');
    }
  } catch (error) {
    // Handle any errors that occur during the database query
    res.send('An error occurred');
  }
});

// app.get('/cv/:userId', async (req, res) => {
//   const userId = req.params.userId;

//   try {
//     // Retrieve the user based on the provided user ID
//     const user = await Ug.findById(userId);

//     if (user) {
//       // Render the attend.ejs file and pass the user details as a variable
//       res.render('cv', { user });
//     } else {
//       // Handle user not found, e.g., show an error message
//       res.send('User not found');
//     }
//   } catch (error) {
//     // Handle any errors that occur during the database query
//     res.send('An error occurred');
//   }
// });





























