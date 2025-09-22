import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "./src/models/User.js"; // extra src

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        const existing = await User.findOne({ email: profile.emails[0].value });
        if (existing)
          return done(null, false, {
            message: "require linking",
            profile,
          });

        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          userName: profile.displayName,
        });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) return done(null, false);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
