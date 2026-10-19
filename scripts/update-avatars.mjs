import mongoose from "mongoose";

const uri = "mongodb+srv://NEXTONE:Next678@nextone.1frrsde.mongodb.net/nextone?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(uri);
  const users = await mongoose.connection.collection("users").find({}).toArray();

  for (const u of users) {
    const isFemale =
      u.gender === "female" ||
      u.name.toLowerCase().includes("sarah") ||
      u.name.toLowerCase().includes("emily");

    const newAvatar = isFemale ? "/avatars/woman-1.svg" : "/avatars/man-1.svg";

    const updateDoc = { avatar: newAvatar };

    // For all established accounts (admin, Sarah, David, Alex, Emily, Marcus), ensure firstLoginCompleted is true
    if (
      u.email === "admin@nextone.com" ||
      u.email === "sarah.lead@nextone.com" ||
      u.email === "david.lead@nextone.com" ||
      u.email === "alex.dev@nextone.com" ||
      u.email === "emily.design@nextone.com" ||
      u.email === "marcus.growth@nextone.com"
    ) {
      updateDoc.firstLoginCompleted = true;
    }

    await mongoose.connection
      .collection("users")
      .updateOne({ _id: u._id }, { $set: updateDoc });

    console.log(`Updated user ${u.name} (${u.email}) with avatar: ${newAvatar}`);
  }

  // Ensure manager@nextone.in has role: manager and firstLoginCompleted: false for testing first login
  const testManager = await mongoose.connection.collection("users").findOne({ email: "manager@nextone.in" });
  if (testManager) {
    await mongoose.connection.collection("users").updateOne(
      { email: "manager@nextone.in" },
      { $set: { role: "manager", firstLoginCompleted: false, managerId: null, avatar: "/avatars/man-1.svg" } }
    );
    console.log("Updated manager@nextone.in -> role: manager, firstLoginCompleted: false");
  }

  console.log("All DB avatars updated to clean SVG and pre-existing accounts marked completed!");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
