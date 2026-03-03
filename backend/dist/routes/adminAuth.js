import { Router } from "express";
const router = Router();
router.post("/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password required"
        });
    }
    if (email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD) {
        return res.json({
            success: true,
            token: "admin-token" // later replace with JWT
        });
    }
    return res.status(401).json({
        success: false,
        message: "Invalid administrator credentials"
    });
});
export default router;
//# sourceMappingURL=adminAuth.js.map