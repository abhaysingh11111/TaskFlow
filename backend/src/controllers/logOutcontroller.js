import redis from '../config/redis.js'

export const logOutcontroller = async (req, res) => {

    try {

        // get token from cookies
        const token = req.cookies.token;

        // blacklist token
        if (token) {

            await redis.set(
                `blacklistedToken:${token}`,
                "true",
                {
                    EX: 60 * 60 * 24 * 7 // 7 days
                }
            );
        }

        // clear cookie
        res.clearCookie("token", {
            httpOnly: true,

            // FIX
            secure:
            process.env.NODE_ENV === "production",

            // FIX
            sameSite: "none"
        });

        return res.status(200).json({
            status: true,
            message: "Logout successful"
        });

    } catch (error) {

        // FIX
        console.log(error.message);

        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};