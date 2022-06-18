// var http = require('http');
// var https = require('https');

const express = require('express')
const app = express();


// var httpServer = http.createServer(app);
// var httpsServer = https.createServer(app);

const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectId;

const config = require('config');
const allowedDomain = ["http://localhost:3000", "https://digitalagencybd.com","https://dagency-demo-fortest.netlify.app"];

app.use(cors({
    origin: allowedDomain,
    credentials: true,
    optionsSuccessStatus: 200
    // methods: ["GET","POST","PUT","DELETE"]
}));

const PORT = process.env.PORT || config.get('server.port');






// const { Socket } = require('socket.io');
// Socket

// ----------------------------------

const admin = require("firebase-admin");
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const serviceAccount = require('./digital-agency-bd-server.json');


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cs9gj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function verifyToken(req, res, next) {
    if(req.headers?.authorization?.startsWith('Bearer ')){
        const token = req.headers.authorization.split(' ')[1];

        try{
            const decodedUser = await admin.auth().verifyIdToken(token);
            req.decodedEmail = decodedUser.email;
        }
        catch{

        }
    }
    next();
}

async function run(){
    try{
        await client.connect();
        console.log('database connected');
        const database = client.db('Digital_Agency_BD');
        const userCollection = database.collection('user');
        const SubscriberCollection = database.collection('Subscriber');
        
        const coursesCollection = database.collection('Courses');
        const servicesCollection = database.collection('Services');
        const servicesReviewCollection = database.collection('servicesreview');
        const studentReviewCollection = database.collection('StudentReview');
        const coursesTemplateCollection = database.collection('CoursesTemplate');
        const CourseVideoCollection = database.collection('Course_video');
        const AddToCartCollection = database.collection('AddTo_Cart');
        const instructorCollection = database.collection('instructor');
        const blogCollection = database.collection('Blog');
        const studentOrderTrackCollection = database.collection('StudentOrderTrack');
        const studentsCollection = database.collection('Students');
        const studentTrackCollection = database.collection('studentClassTrack')
        const QuizCourseCollection = database.collection('QuizCourse');
        const AssignmentCollection = database.collection('Assignment');
        const StudentsInvoiceCollection = database.collection('StudentsInvoice');
        const stuQuestionCollection = database.collection('studentQuestion');
        const QuizMarksCollection = database.collection('QuizMarks');
        const CourseCurriculumCollection = database.collection('CourseCurriculum');
        const Courses202205Collection = database.collection('Courses202205');
        const classBriefCollection = database.collection('classBrief');

        
        
        // ok TEST!
        app.get('/ok', (req, res)=>{
            res.send('ok got it')
        })


// USER!
        // USER!
        app.post('/users', async (req, res)=>{
            const user = req.body;
            const userAdd = await userCollection.insertOne(user);

            res.json(userAdd);
        });

        app.get('/users', async (req, res)=>{
            const user = userCollection.find({});
            const allUser = await user.toArray();

            res.send(allUser);
        });
        
        app.get('/users/:email', verifyToken, async(req, res) =>{
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);

            let isStudent = false;
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            }
            if(user?.userRoll === 'student'){
                isStudent = true;
            }
            res.json({admin: isAdmin, student: isStudent});
        });

        app.put('/users/admin', verifyToken, async (req, res)=>{
            const user = req.body;
            const requester = req.decodedEmail;
            console.log(requester);
            if(requester){
                const requesterAccount = await userCollection.findOne({email: requester});
                if(requesterAccount.role === 'admin'){
                    
                    const filter = { email: user.email };
                    const updateDoc = { $set: {role: 'admin'} };
                    const result = await userCollection.updateOne(filter, updateDoc);

                    res.json(result);
                }
            }
            else{
                res.status(403).json({ message: 'You do not have permission to do this'})
            }
            
        });

        
        app.put('/users/student', verifyToken, async(req, res)=>{
            const studentEmail = req.body;
            const requester = req.decodedEmail;
            if(requester){
                const requesterAccount = await userCollection.findOne({email: requester});
                if(requesterAccount.role === 'admin'){
                    
                    const filter = { email: studentEmail.student };

                    const options = { upsert: true };
                    const updateDoc = {
                        $set: {
                            userRoll: 'student'
                        },
                      };

                    const result = await userCollection.updateOne(filter, updateDoc, options);

                    res.json(result);
                }
            }
            else{
                res.status(403).json({ message: 'You are not admin, you must have permission to do this'})
            }
            // console.log('put', req.decodedEmail);
            
        });


// Subscriber
        // Subscriber
        app.post('/Subscriber', async (req, res)=>{
            const Subscriber = req.body;
            const SubscriberAdd = await SubscriberCollection.insertOne(Subscriber);

            res.json(SubscriberAdd);
        });

        app.get('/Subscriber', async (req, res)=>{
            const Subscriber = SubscriberCollection.find({});

            const allSubscriber = await Subscriber.toArray();

            res.send(allSubscriber);
        });

// COURSES!
       // COURSES!
        app.get('/courses', async (req, res)=>{
            const courses = coursesCollection.find({});

            const allCourses = await courses.toArray();

            res.send(allCourses);
        });

        app.get('/courses/:id', async (req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const course = await coursesCollection.findOne(query);

            res.json(course)
        });

// Services
        // Services
        app.get('/services', async (req, res)=>{
            const services = servicesCollection.find({});

            const allServices = await services.toArray();

            res.send(allServices);
        });

        app.get('/services/:id', async (req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const service = await servicesCollection.findOne(query);
            
            res.json(service)
        });

// Services Reviews!
        // Services Reviews!
        app.get('/servicesreview', async (req, res)=>{
            const servicesreview = servicesReviewCollection.find({});

            const allservicesreview = await servicesreview.toArray();

            res.send(allservicesreview);
        });



// Student Reviews
        // Student Reviews
        app.get('/StudentReview', async (req, res)=>{
            const StudentReview = studentReviewCollection.find({});
            const allStudentReview = await StudentReview.toArray();

            res.send(allStudentReview);
        });
        
        
        
// CoursesTemplate
        // CoursesTemplate
        app.get('/CoursesTemplate', async (req, res)=>{
            const CoursesTemplate = coursesTemplateCollection.find({});
            const allCoursesTemplate = await CoursesTemplate.toArray();

            res.send(allCoursesTemplate);
        });

        app.get('/CoursesTemplate/:id', async (req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};

            const CoursesTem = await coursesTemplateCollection.findOne(query);
            res.json(CoursesTem)
        });

// CLASS VIDEO GET!
        // CLASS VIDEO GET!
        app.post('/CourseVideo', async (req, res)=>{
            const classVideo = req.body;
            const addClassVideo = await CourseVideoCollection.insertOne(classVideo);

            res.json(addClassVideo);
        });
        app.get('/CourseVideo', async (req, res)=>{
            const CourseVideo = CourseVideoCollection.find({});
            const allCourseVideo = await CourseVideo.toArray();

            res.send(allCourseVideo);
        });
        app.get('/CourseVideo/:id', async (req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}

            const CourseVideoID = await CourseVideoCollection.findOne(query);
            res.json(CourseVideoID);
        });

        
// ADD TO CART Setting 
        // ADD TO CART Setting 
        app.post('/AddToCart', async (req, res)=>{
            const addToCart = req.body;
            const addToCartPost = await AddToCartCollection.insertOne(addToCart);

            res.json(addToCartPost);
        });

        app.get('/AddToCart', async (req, res)=>{
            const AddToCart = AddToCartCollection.find({});
            const allAddToCart = await AddToCart.toArray();

            res.send(allAddToCart);
        });
        
        app.get('/AddToCart/:id', async (req, res)=>{
            const id = req.params.id;
            const query =  {_id: ObjectId(id)}

            const AddToCartQuery = await AddToCartCollection.findOne(query);
            res.json(AddToCartQuery);
        });


        // DELETE!
        app.delete('/AddToCart/:id', async (req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            
            
            const AddToCartDelete = await AddToCartCollection.deleteOne(query);
            
            res.json(AddToCartDelete);
        });


// instructor
        // instructor
        app.get('/instructor', async (req, res)=>{
            const instructor = instructorCollection.find({});
            const allInstructor = await instructor.toArray();

            res.send(allInstructor);
        })
        

// Blog
        // Blog
        app.get('/blog', async (req, res)=>{
            const blog = blogCollection.find({});
            const allBlog = await blog.toArray();

            res.send(allBlog);

        });

        app.get('/blog/:id', async (req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}

            const result = await blogCollection.findOne(query);

            res.json(result)
        });


// Student Order Track course handle!
       // Student Order Track course handle!

        app.post('/studentOrderTrack', async (req, res)=>{
            const studentOrderTrack = req.body;
            const studentOrderTrackDB = await studentOrderTrackCollection.insertOne(studentOrderTrack);

            res.json(studentOrderTrackDB);
        });

        app.get('/studentOrderTrack', async (req, res)=>{
            const studentOrderTrack = studentOrderTrackCollection.find({});
            const allStudentOrderTrack = await studentOrderTrack.toArray();

            res.send(allStudentOrderTrack);
        });

        app.get('/studentOrderTrack/:id', async (req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}

            const result = await studentOrderTrackCollection.findOne(query);

            res.json(result)
        });

        app.put('/studentOrderTrack/:id', async (req, res)=>{
            const status = req.body;
            const value = status.value;
            const id = status.id;
            const filter = {_id: ObjectId(id)}; 
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    paymentStatus: value
                },
              };

            const result = await studentOrderTrackCollection.updateOne(filter, updateDoc, options);

            res.json(result)
        });
 
        app.delete('/studentOrderTrack/:id', async (req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}

            const stuOrderTrackDelete = await studentOrderTrackCollection.deleteOne(query);
            
            res.json(stuOrderTrackDelete);
        });

// Students
        // Students
        // Students
        app.get('/Students', async (req, res)=>{
            const Students = studentsCollection.find({});
            const allStudents = await Students.toArray();

            res.send(allStudents);
        });

        app.post('/Students', async (req, res)=>{
            const Students = req.body;
            const addStudents = await studentsCollection.insertOne(Students)

            res.json(addStudents);
        });

        app.put('/Students/:id', async (req, res) =>{
            const Students = req.body;
            const image = Students.stu_image;
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const option = { upsert: true };
            const sendImage = {
                $set: {
                    stu_image: image
                }
            };
            const result = await studentsCollection.updateOne(filter, sendImage, option)

            res.json(result)
        });

// studentClassTrack
        // studentClassTrack
        app.post('/studentClassTrack', async (req, res)=>{
            const studentTrack = req.body;
            const addStudentClass = await studentTrackCollection.insertOne(studentTrack)

            res.json(addStudentClass);
        });

        app.get('/studentClassTrack', async (req, res)=>{
            const studentClassTrack = studentTrackCollection.find({});
            const classTrack = await studentClassTrack.toArray();

            res.send(classTrack)
        })
        
        app.get('/studentClassTrack/:id', async (req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}

            const result = await studentTrackCollection.findOne(query);
            res.json(result)
        })

        
        app.put('/studentClassTrack/:studentEmail', async (req, res) =>{
            const email = req.body.studentEmail;
            const courseCode = req.body.course_code;
            const course_class_no = req.body.course_class_no;
            console.log(req.body);
            const query = {
                studentEmail : email, 
                course_code: courseCode
            }
            // const resultGte = studentTrackCollection.find(query);
            // const trackCourse = await resultGte.toArray();
            const option = {upsert: true};
            const updateDoc = {
                $set: {
                    course_class_no: course_class_no
                },
            };
            const inserResult = await studentTrackCollection.updateOne(query, updateDoc, option);

            res.json(inserResult)
        })


// CourseQuizQusetion!
        // CourseQuizQusetion!

        app.get('/QuizCourse', async (req, res)=>{
            const QuizCourse = QuizCourseCollection.find({});
            const AllQuiz = await QuizCourse.toArray();

            res.send(AllQuiz);
        })

        app.post('/QuizCourse', async (req, res)=>{
            const QuizCourse = req.body;
            const sendQuizCourse = await QuizCourseCollection.insertOne(QuizCourse)

            res.json(sendQuizCourse)
        })

// Assignment
        // Assignment

        app.post('/Assignment', async (req, res)=>{
            const Assignment = req.body;
            const sendAssignment = await AssignmentCollection.insertOne(Assignment)

            res.json(sendAssignment)
        });


        app.get('/Assignment', async (req, res)=>{
            const Assignment = AssignmentCollection.find({});
            const allAssignment = await Assignment.toArray();

            res.send(allAssignment);
        });

        app.put('/Assignment/:id', async (req, res)=>{
            const marksBody = req.body;
            const message = marksBody.message;
            const marksGet = marksBody.marks;
            // -----------------------------
            const marks = marksGet;
            const id = req.params.id;
            // -----------------------
            const filter = {_id: ObjectId(id)};
            const option = { upsert: true};
            const sendData = {
                $set: {
                    message: message,
                    marks: marks
                },
            };
            const result = await AssignmentCollection.updateOne(filter, sendData, option);
            res.json(result);
        })

// Student Invoice
        // Student Invoice
        app.post('/StudentsInvoice', async (req, res)=>{
            const StudentsInvoice = req.body;
            const sendInvoice = await StudentsInvoiceCollection.insertOne(StudentsInvoice);

            res.json(sendInvoice)
        });
        app.get('/StudentsInvoice', async (req, res)=>{
            const StudentsInvoice = StudentsInvoiceCollection.find({});
            const allStuInvoice = await StudentsInvoice.toArray();

            res.send(allStuInvoice);
        })
// Student Question!
        // Student Question!
        app.post('/stuQuestion', async (req, res)=>{
            const stuQuestion = req.body;
            const sendStuQuestion = await stuQuestionCollection.insertOne(stuQuestion);

            res.json(sendStuQuestion)
        })
        app.get('/stuQuestion', async (req, res)=>{
            const stuQuestion = stuQuestionCollection.find({});
            const allStuQuestion = await stuQuestion.toArray();

            res.send(allStuQuestion);
        })
        app.delete('/stuQuestion/:id', async (req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}

            const stuQuestionDelete = await stuQuestionCollection.deleteOne(query);

            res.json(stuQuestionDelete);
        })

        app.put('/stuQuestion/:id', async (req, res)=>{
            const answerGet = req.body;
            const answer = answerGet.answer;
            const id  = req.params.id;
            const filter = {_id: ObjectId(id)};
            const option = { upsert: true };
            const answerSend = {
                $set: {
                    answer: answer
                }
            };
            const result = await stuQuestionCollection.updateOne(filter, answerSend, option)

            res.json(result)
        })

  
// QuizMarks upload
        // QuizMarks upload

        app.get('/QuizMarks', async (req, res)=>{
            const QuizMarks = QuizMarksCollection.find({});
            const allQuizMarks = await QuizMarks.toArray();

            res.send(allQuizMarks)
        });

        app.post('/QuizMarks', async (req, res)=>{
            const QuizMarks = req.body;
            const sendQuizMarks = await QuizMarksCollection.insertOne(QuizMarks);

            res.json(sendQuizMarks)
        });

// Courses202205
    // Courses202205
    app.get('/Courses202205', async (req, res)=>{
        const Courses202205 = Courses202205Collection.find({});
        const stuCourses202205 = await Courses202205.toArray();

        res.json(stuCourses202205);
    });   

// classBrief
    // classBrief
    app.get('/classBrief', async (req, res)=>{
        const classBrief = classBriefCollection.find({});
        const classBriefAll = await classBrief.toArray();

        res.json(classBriefAll);
    })

    app.put('/classBrief/:courseCode', async (req, res)=>{
        const classBriefBody = req.body;
        const class_Brief_Title = classBriefBody.class_Brief_Title;
        const class_Brief = classBriefBody.class_Brief;
        // --------------------------------------
        
        // filter process 
        const id = req.params.courseCode;
        const CourseCode = Number(id);
        const filter = {course_code: CourseCode};
        const option = { upsert: true };
        // --------------------------------------
        
        // sending Data 
        const sendData = {
            $set: {
                class_Brief_Title: class_Brief_Title,
                class_Brief: class_Brief
            },
        };
        const result = await classBriefCollection.updateOne(filter, sendData, option);
        // ------------------

      
        res.json(result);
    } )



    }
    finally{
        // await client.close()
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.listen(PORT, () => {
  console.log('ITs ok');
})

// httpServer.listen(8080, function (){
//     console.log('Im  listening on port 8080');
// });

// httpsServer.listen(8443, function (){
//     console.log('Im  listening on port 8443');

// });

