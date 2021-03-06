const express = require('express')
const sessions = require('express-session')
const path = require('path');
const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Link with angular
var distDir = path.join(__dirname, "../client/dist/");
console.log("Using distDir -> ", distDir);
app.use(express.static(distDir));

// Session
app.use(sessions({
  secret: 'super duper secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

// Database
const mysql = require('mysql2')
const db = mysql.createConnection({
  host: 'localhost',
  user: 'coviddbuser',
  password: '$soenpm!',
  database: 'covid'
})

// User Types -> we should get this from the db, but we can hardcode for now
const userTypes = {
  "patient": 1,
  "doctor": 2,
  "nurse": 3,
  "manager": 4
};

/*
  currentUser - will need a better solution eventually. This only supports a single user
  look into express-session, cookie-session, passportjs, or a homemade localStorage solution
*/ 
var currentUser = null;

// Start
app.listen(port, () => {
  console.log(`Covid19 Data Collection server listening at http://localhost:${port}`)
})

// Login
app.post("/api/login", function (req, res) {
  console.log('Received login request ...', req.body);
  const body = req.body;

  const sql = `SELECT * FROM user WHERE email = '${body.email}' AND password = '${body.password}'`;

  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err.sqlMessage);
      res.status(400).send(err.sqlMessage);
    } else if (rows.length === 0) {
      console.log("Invalid Credentials");
      res.status("401");
      res.send("Invalid Credentials");
    } else if (rows[0].approved === null) {
      console.log("Unauthorized Access");
      res.status("403");
      res.send("Unauthorized Access");
    } else {
      currentUser = rows[0];
      var session=req.session;
      session.userid = currentUser.id;
      console.log("Login succesful");
      res.json(currentUser);
    }    
  });
});

// Logout
app.get("/api/logout", function (req, res) {
  const currentId = req.session.userid;
  console.log(`Received logout request for userid ${currentId} ...`);

  req.session.destroy(() => {
    console.log('User logged out.')
    res.status(200).send();
  })
});

// Register
app.post("/api/register", function (req, res) {
  const request = req.body.registrationRequest;
  console.log('Received registration request ...', request);

  // patients are automatically approved. Doctors and Nurses require approval;
  var approved = null;
  if (request.userType === 'patient') {
    approved = 1;
  }

  let regNumber = null;
  if (request.registrationNumber) {
    regNumber = "'" + request.registrationNumber + "'";
  }

  const sql = `INSERT INTO user (
    fullName,
    address,
    dateOfBirth,
    phoneNumber,
    email,
    password,
    fkUserType,
    registrationDate,
    lastLoginDate,
    active,
    approved,
    registrationNumber) VALUES (
     '${sanitize(request.fullName)}',
     '${sanitize(request.address)}',
     '${request.dateOfBirth}',
     '${request.phoneNumber}',
     '${sanitize(request.email)}',
     '${sanitize(request.password)}',
      ${userTypes[request.userType]},
      '${getTodayDate()}',
      null,
      1,
      ${approved},
      ${regNumber}
    )`;

  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err.sqlMessage);
      res.status(400).send(err.sqlMessage);
    } else if (rows.length === 0) {
      res.status("500");
      res.send("Server Error during Registration.");
    } else {
      res.status(201).json(request.userType);
    }    
  });
});

app.post("/api/users/approve", function (req, res) {
  const body = req.body.user;
  console.log('Received approval request ...', req.body);
  const updateSql = `UPDATE user SET approved=1 WHERE email= '${body.email}'`;

  db.query(updateSql, (err, rows) => {
    if (err) {
      console.log(err);
      res.status("500").send("Error while updating approval status.");
    } else {
      console.log('Update successful');
    }
  })
});

app.get("/api/users/current", function (req, res) {
  const currentId = req.session.userid;
  if (!currentId) {
    res.status("404").send("No current user.");
  } else {
    const sql = `SELECT * FROM user WHERE id = ${currentId};`;
    db.query(sql, (err, rows) => {
      if (err) throw err;
      if (rows.length === 0) {
        res.status("404").send("Couldn't find user.");
      } else {
        const currentUser = rows[0];
        res.json(currentUser);
      }    
  });}
});

// Getting all list of users
app.get('/api/users/all-users', function (req, res) {
  const sql = `SELECT * FROM user`;
  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
      res.status("500").send("Error while fetching list users.");
    } else {
      console.log(rows);
      res.status(200).json(rows);
    }
  })
});

// Deleting a user
app.post("/api/users/delete-user", function (req, res) {
  const body = req.body.user;
  console.log('Received user deletion request ...', req.body);
  const deleteUserSql = `DELETE FROM user WHERE email= '${body.email}'`;

  if (body.fkUserType == 1) {
    // TODO handle patient case
  } else {
    // Deleting nurse or doctor
    const resetAssementSql =  `UPDATE assessment
    SET viewedByNurse = 0 AND assignedDoctorId = null
    WHERE (active = 1 AND
      fkPatientId IN (
        SELECT fkPatientId
        FROM appointment
        WHERE fkProfessionalId = ${body.id})) OR assignedDoctorId = ${body.id};`

        db.query(resetAssementSql, (err, rows) => {
          if (err) {
            console.log(err);
            res.status("500").send("Error while updating existing tests for deleted professional.");
          } else {
            console.log('update successful');
          }
        })

  }

  db.query(deleteUserSql, (err, rows) => {
    if (err) {
      console.log(err);
      res.status("500").send("Error while deleting a user.");
    } else {
      console.log('Delete successful');
    }
  })
});


app.post("/api/users/reject", function (req, res) {
  const body = req.body.user;
  console.log('Received Rejection request ...', req.body);
  const updateSql = `UPDATE user SET approved=0 WHERE email= '${body.email}'`;

  db.query(updateSql, (err, rows) => {
    if (err) {
      console.log(err);
      res.status("500").send("Error while updating approval rejection status.");
    } else {
      console.log('Update successful');
    }
  })
});

app.get("/api/users/unapproved", function (req, res) {
  console.log('hello')
  const sql = `SELECT * FROM user WHERE approved is NULL;`;
  db.query(sql, (err, rows) => {
    if (err) throw err;
    if (rows.length === 0) {
      res.status("500").send("Error while getting unApproved Users.");
    } else {
      res.json(rows);
    }    
});
});

app.post("/api/patients/reject", function (req, res) {
  const body = req.body.selfAssessmentForTable;
  console.log('Received assement rejection request ...', req.body);
  const updateSql = `UPDATE assessment SET rejected=1 WHERE fkPatientId= '${body.userId}'`;

  db.query(updateSql, (err, rows) => {
    if (err) {
      console.log(err);
      res.status("500").send("Error while updating assessment status.");
    } else {
      console.log('Update successful');
    }
  })
});

app.post("/api/self-assessment-test", function (req, res) {
  const currentId = req.session.userid;
  if (!currentId) {
    res.status("400").send("No current user. Bad Request");
  } else {
    const body = req.body;
    console.log('/api/self-assessment-test body', body);

    // Set existing self-assessment for user to viewedByNurse ... we might want to have active flag instead.
    const updateSql = `UPDATE assessment SET viewedByNurse=1, assignedDoctorId=null, active=0 WHERE fkPatientId=${currentId}`;
    db.query(updateSql, (err, rows) => {
      if (err) {
        console.log(err);
        res.status("500").send("Error while inserting self-assessment test.");
      } else {
        console.log('Update succesful');
      }
    })

    // Delete any existing appointments.
    const deleteExistingAppointments = `DELETE FROM appointment WHERE fkPatientId = ${currentId}`;
    db.query(deleteExistingAppointments, (err, rows) => {
      if (err) {
        console.log(err);
        res.status("500").send("Error while deleting existing appointments.");
      } else {
        console.log('Update succesful');
      }
    })

    const insertSql = `INSERT INTO assessment (date, viewedByNurse, fkPatientId, q_difficultyBreathing, q_ageRange, q_firstSymptoms, q_situation, q_secondSymptoms, q_hasBeenCloseContact,
    q_hasBeenTested, q_hasTraveled) VALUES ('${getTodayDate()}', 0, ${currentId}, ${body.q_difficultyBreathing}, 
    '${body.q_ageRange}',${body.q_firstSymptoms},${body.q_situation},${body.q_secondSymptoms}, ${body.q_hasBeenCloseContact}, ${body.q_hasBeenTested}, ${body.q_hasTraveled})`
    db.query(insertSql, (err, rows) => {
      if (err) {
        console.log(err);
        res.status("500").send("Error while inserting self-assessment test.");
      }
      if (rows.length === 0) {
        res.status("500").send("Error while inserting self-assessment test.");
      } else {
        const assessment = rows[0];
        console.log("Self-Assessment Test", assessment);
        res.status(201).json(assessment);
      }    
  });}
});

app.get('/api/self-assessment-test/unviewed', function (req, res) {
  console.log("Request Tests for Nurses")
  const sql = `SELECT a.fkPatientId AS userId, user.fullName, a.id AS testId, a.date, a.q_difficultyBreathing, a.q_ageRange, a.q_firstSymptoms, a.q_situation, a.q_secondSymptoms, 
  a.q_hasBeenCloseContact, a.q_hasBeenTested, a.q_hasTraveled
  FROM assessment a
  JOIN user ON user.id = a.fkPatientId
  WHERE viewedByNurse = 0 AND user.fkUserType = 1 AND user.active = 1 AND rejected = 0 AND a.fkPatientId NOT IN (SELECT fkPatientId from appointment)
  ORDER BY a.date ASC;`

  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
      res.status("500").send("Error while getting unviewed self-assessment tests.");
    } else {
      console.log(rows);
      res.status(200).json(rows);
    }
  })
});

app.get('/api/self-assessment-test/doctor/:doctorId',  function (req, res) {
  const sql = `SELECT a.fkPatientId AS userId, user.fullName, a.id AS testId, a.date, a.q_difficultyBreathing, a.q_ageRange, a.q_firstSymptoms, a.q_situation, a.q_secondSymptoms, 
  a.q_hasBeenCloseContact, a.q_hasBeenTested, a.q_hasTraveled
  FROM assessment a
  JOIN user ON user.id = a.fkPatientId
  WHERE assignedDoctorId = ${req.params.doctorId} AND user.fkUserType = 1 AND user.active = 1 AND rejected = 0 AND a.fkPatientId NOT IN (SELECT fkPatientId from appointment)
  ORDER BY a.date ASC;`

  console.log(sql);

  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
      res.status("500").send("Error while getting unviewed self-assessment tests.");
    } else {
      console.log(rows);
      res.status(200).json(rows);
    }
  })
});

app.get('/api/users/doctors', function (req, res) {
  const sql = `SELECT * FROM user WHERE fkUserType = 2 AND active=1 AND approved=1`;
  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
      res.status("500").send("Error while fetching doctors.");
    } else {
      console.log(rows);
      res.status(200).json(rows);
    }
  })
})

app.post('/api/self-assessment-test/assign', function (req, res) {
  console.log(`Received request to assign test ${req.body.assessment.testId} to doctor ${req.body.doctor.id} ...`);
  const sql = `UPDATE assessment SET assignedDoctorId = ${req.body.doctor.id}, viewedByNurse = 1 WHERE id = ${req.body.assessment.testId}`;
  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
      res.status("500").send("Error while assigning test to doctor.");
    } else {
      res.status(200).json(rows);
    }
  })
});

app.get('/api/schedule/:userId', function (req, res) {
  const sql = `SELECT a.id as scheduleId, a.location, a.startDateTime, a.endDateTime, a.fkProfessionalId as professioanlId, u.id as patientId, u.fullName as patientFullName FROM appointment a JOIN user u ON u.id = a.fkPatientId WHERE a.fkProfessionalId = ${req.params.userId};`
  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
      res.status("500").send(`Error while loading schedule for ID ${req.params.userId}.`);
    } else {
      console.log(rows);
      res.status(200).json(rows);
    }
  })
});

app.get('/api/self-assessment-test/status/:patientId', function (req, res) {
  const sql = `SELECT patient.id AS patientId, ass.id AS assessmentId, ass.date AS assessmentDate, ass.viewedByNurse, ass.assignedDoctorId, doctor.fullName AS doctorFullName, app.location, app.startDateTime AS appointmentTime, ass.rejected, appointmentProfessional.fullName AS appointmentProfessionalFullName
  FROM assessment ass
  JOIN user patient ON patient.id = ass.fkPatientId
  LEFT JOIN user doctor ON ass.assignedDoctorId = doctor.id
  LEFT JOIN appointment app ON app.fkPatientId = patient.id
  LEFT JOIN user appointmentProfessional ON app.fkProfessionalId = appointmentProfessional.id
  WHERE ass.id = (select max(id) from assessment where fkPatientId = ${req.params.patientId}) AND ass.active = 1;`

  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
      res.status("500").send(`Error while loading assessment status for ${req.params.patientId}.`);
    } else {
      console.log(rows);
      res.status(200).json(rows);
    }
  });
});

//Edit User Profile 
app.put("/api/users/editprofile", function (req, res) {
  const body = req.body;
  console.log('Received profile edit request ...', body);

  const sql = `UPDATE 
                    user 
                SET
                  fullName = '${sanitize(body.fullName)}',
                  address = '${sanitize(body.address)}',
                  phoneNumber = '${body.phoneNumber}',
                  lastLoginDate = '${getTodayDate()}',
                  dateOfBirth = '${body.dateOfBirth}'
                WHERE
                email = '${body.email}' `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err.sqlMessage);
      res.status(400).send(err.sqlMessage);
    } else {
      console.log(rows);
      res.status(200).json(rows);
    }   
  });
});

app.post("/api/schedule", function (req, res) {
  const body = req.body;
  console.log('Received create appointment request ...', body);

  const sql = `INSERT INTO appointment (location, startDateTime, endDateTime, fkPatientId, fkProfessionalId) VALUES (
  '${body.location}', '${body.startDateTime}', '${body.endDateTime}', ${body.fkPatientId}, ${body.fkProfessionalId});`

  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
      res.status("500").send(`Error while saving appoitment.`);
    } else {
      const updateSql = `UPDATE assessment SET viewedByNurse=1 WHERE fkPatientId=${body.fkPatientId}`;
      db.query(updateSql, (err, rows) => {
        if (err) {
          console.log(err);
          res.status("500").send(`Error while saving appoitment.`);
        } else {
          console.log(rows);
          res.status(200).json(rows);
        }
      });
    }
  });
});


app.get("/api/reports/:baseDate", function(req, res) {
  const date = req.params.baseDate;
  console.log(`Received request to get reports for baseDate [${date}] `);
  
  const sql = `SELECT 
    SUM(CASE WHEN (DATEDIFF('${date}', date) = 0) THEN 1 ELSE 0 END) AS daily, 
    SUM(CASE WHEN (DATEDIFF('${date}', date) BETWEEN 0 AND 7) THEN 1 ELSE 0 END) AS weekly,
    SUM(CASE WHEN (DATEDIFF('${date}', date) BETWEEN 0 AND 30) THEN 1 ELSE 0 END) AS monthly 
   FROM assessment;`

   console.log(sql);

   db.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
      res.status("500").send(`Error while getting report values.`);
    } else {
      console.log(rows);
      res.status(200).json(rows);
    }
  });
});

app.delete("/api/schedule/:appointmentId", function (req, res) {
  console.log(`Received request to delete appointment #${req.params.appointmentId}`);
  const sql = `DELETE FROM appointment WHERE id = ${req.params.appointmentId}`;

  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
      res.status("500").send(`Error while deleting appointment.`);
    } else {
      console.log(rows);
      res.status(200).json(rows);
    }
  });
});

app.delete("/api/appointment/:patientId", function (req, res) {
  console.log(`Received request to delete appointment with patientId #${req.params.patientId}`);
  const sql = `DELETE FROM appointment WHERE fkPatientId = ${req.params.patientId}`;

  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
      res.status("500").send(`Error while deleting appointment.`);
    } else {
      console.log(rows);
      res.status(200).json(rows);
    }
  });
});

app.post('/api/self-assessment-test/status', function (req, res) {
  console.log(`Received request to update the assessement status...`);
  console.log(req.body.assessmentId);
  const sql = `UPDATE assessment SET active = 0 WHERE id = ${req.body.assessmentId}`;
  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
      res.status("500").send("Error while updating assessement status.");
    } else {
      res.status(200).json(rows);
    }
  })
});


function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function sanitize(value) {
  return value.replace("'", "''");
}

// module.exports = app;