import mongoose from "mongoose";

const uri = "mongodb+srv://NEXTONE:Next678@nextone.1frrsde.mongodb.net/nextone?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(uri);
  const users = await mongoose.connection.collection("users").find({}).toArray();
  for (const u of users) {
    if (u.avatar && u.avatar.includes("images.unsplash.com")) {
      const isFemale =
        u.gender === "female" ||
        u.name.toLowerCase().includes("sarah") ||
        u.name.toLowerCase().includes("emily");
      const newAvatar = isFemale
        ? "/avatars/avatar-female-3d.jpg"
        : "/avatars/avatar-male-3d.jpg";
      await mongoose.connection
        .collection("users")
        .updateOne({ _id: u._id }, { $set: { avatar: newAvatar } });
      console.log("Updated avatar for", u.name, "to", newAvatar);
    }
  }

  // Also, for manager@nextone.in: reset firstLoginCompleted to false and set role to manager if user intended manager
  const managerUser = await mongoose.connection.collection("users").findOne({ email: "manager@nextone.in" });
  if (managerUser) {
    await mongoose.connection.collection("users").updateOne(
      { email: "manager@nextone.in" },
      { $set: { role: "manager", firstLoginCompleted: false, managerId: null } }
    );
    console.log("Updated manager@nextone.in to role: manager and firstLoginCompleted: false");
  }

  console.log("Avatar & user migration complete!");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
