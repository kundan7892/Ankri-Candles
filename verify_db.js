// verify_db.js - Automated local backend verification script


async function testBackend() {
    console.log("=== STARTING BACKEND INTEGRATION TESTS ===");
    const base = "http://localhost:5000";

    // Test 1: Admin Login with wrong credentials
    try {
        const loginFail = await fetch(`${base}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'superadmin', password: 'wrongpassword' })
        });
        const resFail = await loginFail.json();
        console.log("Test 1 (Invalid Login) Status:", loginFail.status, "Response:", resFail);
        if (loginFail.status === 401 && !resFail.success) {
            console.log("✅ Test 1 Passed: Invalid login rejected.");
        } else {
            console.log("❌ Test 1 Failed.");
        }
    } catch (err) {
        console.error("Test 1 Error:", err.message);
    }

    // Test 2: Admin Login with correct credentials
    try {
        const loginSuccess = await fetch(`${base}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'superadmin', password: 'adminpassword123' })
        });
        const resSuccess = await loginSuccess.json();
        console.log("Test 2 (Valid Login) Status:", loginSuccess.status, "Response:", resSuccess);
        if (loginSuccess.status === 200 && resSuccess.success) {
            console.log("✅ Test 2 Passed: Admin login authenticated successfully.");
        } else {
            console.log("❌ Test 2 Failed.");
        }
    } catch (err) {
        console.error("Test 2 Error:", err.message);
    }

    // Test 3: Post Booking
    const orderId = `AE-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
    const bookingBody = {
        orderId: orderId,
        customerInfo: {
            name: "Verification Customer",
            email: "verify@test.com",
            phone: "9876543219",
            address: "M.G. Road, Bangalore, India"
        },
        items: [
            { id: "sig-5", name: "Kesar Pista", price: 699, description: "Sweet & Festive", quantity: 2, isCustom: false }
        ],
        subtotal: 1398,
        shipping: 0,
        total: 1398,
        status: 'Pending'
    };

    try {
        const postBooking = await fetch(`${base}/api/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingBody)
        });
        const resBooking = await postBooking.json();
        console.log("Test 3 (Post Booking) Status:", postBooking.status, "Response:", resBooking.message);
        if (postBooking.status === 201) {
            console.log("✅ Test 3 Passed: Booking registered successfully.");
        } else {
            console.log("❌ Test 3 Failed.");
        }
    } catch (err) {
        console.error("Test 3 Error:", err.message);
    }

    // Test 4: Post Payment
    const transactionId = `TXN-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentBody = {
        transactionId: transactionId,
        orderId: orderId,
        amount: 1398,
        paymentMethod: "UPI",
        status: "Success"
    };

    try {
        const postPayment = await fetch(`${base}/api/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentBody)
        });
        const resPayment = await postPayment.json();
        console.log("Test 4 (Post Payment) Status:", postPayment.status, "Response:", resPayment.message);
        if (postPayment.status === 201) {
            console.log("✅ Test 4 Passed: Payment registered successfully.");
        } else {
            console.log("❌ Test 4 Failed.");
        }
    } catch (err) {
        console.error("Test 4 Error:", err.message);
    }

    // Test 5: Get Bookings & Get Payments
    try {
        const getBookings = await fetch(`${base}/api/bookings`);
        const bookings = await getBookings.json();
        console.log("Test 5a (Get Bookings) Count:", bookings.length);
        const foundBooking = bookings.find(b => b.orderId === orderId);
        if (foundBooking) {
            console.log("✅ Test 5a Passed: Active booking verified in database.");
        } else {
            console.log("❌ Test 5a Failed.");
        }

        const getPayments = await fetch(`${base}/api/payments`);
        const payments = await getPayments.json();
        console.log("Test 5b (Get Payments) Count:", payments.length);
        const foundPayment = payments.find(p => p.transactionId === transactionId);
        if (foundPayment) {
            console.log("✅ Test 5b Passed: Active payment verified in database.");
        } else {
            console.log("❌ Test 5b Failed.");
        }
    } catch (err) {
        console.error("Test 5 Error:", err.message);
    }

    console.log("=== BACKEND INTEGRATION TESTS COMPLETED ===");
}

testBackend();
