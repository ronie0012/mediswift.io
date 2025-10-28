// Enhanced Postman Test Scripts for MediSwift API Validation

// 1. Authentication Tests
const authTests = {
    // Login Test
    loginTest: `
        pm.test("Status code is 200", function () {
            pm.response.to.have.status(200);
        });

        pm.test("Response has required fields", function () {
            const responseJson = pm.response.json();
            pm.expect(responseJson).to.have.property('access');
            pm.expect(responseJson).to.have.property('refresh');
            pm.expect(responseJson).to.have.property('user');
        });

        pm.test("Tokens are valid strings", function () {
            const responseJson = pm.response.json();
            pm.expect(responseJson.access).to.be.a('string').and.not.empty;
            pm.expect(responseJson.refresh).to.be.a('string').and.not.empty;
        });

        if (pm.response.code === 200) {
            const responseJson = pm.response.json();
            pm.environment.set('access_token', responseJson.access);
            pm.environment.set('refresh_token', responseJson.refresh);
            console.log('Tokens saved to environment');
        }
    `,

    // Registration Test
    registrationTest: `
        pm.test("Status code is 201", function () {
            pm.response.to.have.status(201);
        });

        pm.test("User created successfully", function () {
            const responseJson = pm.response.json();
            pm.expect(responseJson).to.have.property('user');
            pm.expect(responseJson).to.have.property('message');
            pm.expect(responseJson.message).to.include('successfully');
        });

        pm.test("Response includes tokens", function () {
            const responseJson = pm.response.json();
            pm.expect(responseJson).to.have.property('tokens');
            pm.expect(responseJson.tokens).to.have.property('access');
            pm.expect(responseJson.tokens).to.have.property('refresh');
        });
    `,

    // Token Verification Test
    tokenVerifyTest: `
        pm.test("Status code is 200", function () {
            pm.response.to.have.status(200);
        });

        pm.test("Token is valid", function () {
            // If we get 200, token is valid
            pm.expect(pm.response.code).to.equal(200);
        });
    `
};

// 2. Healthcare API Tests
const healthcareTests = {
    // Generic List Test
    listTest: `
        pm.test("Status code is 200", function () {
            pm.response.to.have.status(200);
        });

        pm.test("Response is an array", function () {
            const responseJson = pm.response.json();
            pm.expect(responseJson).to.be.an('array');
        });

        pm.test("Response time is less than 2000ms", function () {
            pm.expect(pm.response.responseTime).to.be.below(2000);
        });
    `,

    // Generic Detail Test
    detailTest: `
        pm.test("Status code is 200", function () {
            pm.response.to.have.status(200);
        });

        pm.test("Response is an object", function () {
            const responseJson = pm.response.json();
            pm.expect(responseJson).to.be.an('object');
        });

        pm.test("Response has id field", function () {
            const responseJson = pm.response.json();
            pm.expect(responseJson).to.have.property('id');
        });
    `,

    // Specialization Tests
    specializationTest: `
        pm.test("Status code is 200", function () {
            pm.response.to.have.status(200);
        });

        pm.test("Specialization has required fields", function () {
            const responseJson = pm.response.json();
            if (Array.isArray(responseJson) && responseJson.length > 0) {
                const specialization = responseJson[0];
                pm.expect(specialization).to.have.property('id');
                pm.expect(specialization).to.have.property('name');
                pm.expect(specialization).to.have.property('description');
            }
        });
    `,

    // Doctor Tests
    doctorTest: `
        pm.test("Status code is 200", function () {
            pm.response.to.have.status(200);
        });

        pm.test("Doctor has required fields", function () {
            const responseJson = pm.response.json();
            if (Array.isArray(responseJson) && responseJson.length > 0) {
                const doctor = responseJson[0];
                pm.expect(doctor).to.have.property('id');
                pm.expect(doctor).to.have.property('user');
                pm.expect(doctor).to.have.property('specialization');
                pm.expect(doctor).to.have.property('license_number');
                pm.expect(doctor).to.have.property('is_available');
            }
        });
    `,

    // Patient Tests
    patientTest: `
        pm.test("Status code is 200", function () {
            pm.response.to.have.status(200);
        });

        pm.test("Patient has required fields", function () {
            const responseJson = pm.response.json();
            if (Array.isArray(responseJson) && responseJson.length > 0) {
                const patient = responseJson[0];
                pm.expect(patient).to.have.property('id');
                pm.expect(patient).to.have.property('user');
                pm.expect(patient).to.have.property('date_of_birth');
                pm.expect(patient).to.have.property('gender');
            }
        });
    `,

    // Appointment Tests
    appointmentTest: `
        pm.test("Status code is 200", function () {
            pm.response.to.have.status(200);
        });

        pm.test("Appointment has required fields", function () {
            const responseJson = pm.response.json();
            if (Array.isArray(responseJson) && responseJson.length > 0) {
                const appointment = responseJson[0];
                pm.expect(appointment).to.have.property('id');
                pm.expect(appointment).to.have.property('doctor');
                pm.expect(appointment).to.have.property('patient');
                pm.expect(appointment).to.have.property('appointment_date');
                pm.expect(appointment).to.have.property('status');
            }
        });
    `,

    // Create Appointment Test
    createAppointmentTest: `
        pm.test("Status code is 201", function () {
            pm.response.to.have.status(201);
        });

        pm.test("Appointment created successfully", function () {
            const responseJson = pm.response.json();
            pm.expect(responseJson).to.have.property('id');
            pm.expect(responseJson).to.have.property('status');
            pm.expect(responseJson.status).to.equal('scheduled');
        });

        // Save appointment ID for future tests
        if (pm.response.code === 201) {
            const responseJson = pm.response.json();
            pm.environment.set('created_appointment_id', responseJson.id);
        }
    `
};

// 3. Error Handling Tests
const errorTests = {
    unauthorizedTest: `
        pm.test("Status code is 401 for unauthorized access", function () {
            pm.response.to.have.status(401);
        });

        pm.test("Error message is present", function () {
            const responseJson = pm.response.json();
            pm.expect(responseJson).to.have.property('detail');
        });
    `,

    notFoundTest: `
        pm.test("Status code is 404 for not found", function () {
            pm.response.to.have.status(404);
        });
    `,

    validationErrorTest: `
        pm.test("Status code is 400 for validation errors", function () {
            pm.response.to.have.status(400);
        });

        pm.test("Validation errors are detailed", function () {
            const responseJson = pm.response.json();
            pm.expect(responseJson).to.be.an('object');
        });
    `
};

// 4. Performance Tests
const performanceTests = {
    responseTimeTest: `
        pm.test("Response time is less than 2000ms", function () {
            pm.expect(pm.response.responseTime).to.be.below(2000);
        });
    `,

    fastResponseTest: `
        pm.test("Response time is less than 500ms", function () {
            pm.expect(pm.response.responseTime).to.be.below(500);
        });
    `
};

// 5. Data Validation Tests
const dataValidationTests = {
    emailFormatTest: `
        pm.test("Email format is valid", function () {
            const responseJson = pm.response.json();
            if (responseJson.user && responseJson.user.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                pm.expect(responseJson.user.email).to.match(emailRegex);
            }
        });
    `,

    dateFormatTest: `
        pm.test("Date format is valid", function () {
            const responseJson = pm.response.json();
            if (responseJson.appointment_date) {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                pm.expect(responseJson.appointment_date).to.match(dateRegex);
            }
        });
    `,

    timeFormatTest: `
        pm.test("Time format is valid", function () {
            const responseJson = pm.response.json();
            if (responseJson.start_time) {
                const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
                pm.expect(responseJson.start_time).to.match(timeRegex);
            }
        });
    `
};

console.log("Postman validation tests loaded successfully!");