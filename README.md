# 🎨 Kalaverse

### Preserving traditional craftsmanship through interactive learning

Kalaverse is a web-based social learning platform that helps **independent artists, artisans, and traditional craft practitioners** share their work and teach their techniques through **interactive AR-assisted tutorials**.

Instead of relying only on passive videos or written instructions, Kalaverse combines:

**Artisan knowledge + Social discovery + Structured tutorials + Hand tracking + AI feedback**

The goal is not to replace the artist with AI, but to use technology to **amplify human expertise, preserve traditional knowledge, and make hands-on learning more accessible.**

---

## 📌 Table of Contents

* [Problem](#-problem)
* [Why Kalaverse?](#-why-kalaverse)
* [Solution](#-solution)
* [Key Features](#-key-features)
* [How It Works](#-how-it-works)
* [User Roles](#-user-roles)
* [Expert Workflow](#-expert-workflow)
* [Learner Workflow](#-learner-workflow)
* [AR Tutorial System](#-ar-tutorial-system)
* [MediaPipe Integration](#-mediapipe-integration)
* [Gemini AI Integration](#-gemini-ai-integration)
* [System Architecture](#-system-architecture)
* [Technology Stack](#-technology-stack)
* [Project Structure](#-project-structure)
* [Data Model](#-data-model)
* [Tutorial Step Logic](#-tutorial-step-logic)
* [Installation](#-installation)
* [Environment Variables](#-environment-variables)
* [Running the Project](#-running-the-project)
* [MVP Scope](#-mvp-scope)
* [Future Enhancements](#-future-enhancements)
* [Limitations](#-limitations)
* [Social Impact](#-social-impact)
* [Contributing](#-contributing)
* [License](#-license)

---

# 🌍 Problem

Traditional art and craft knowledge is often passed from **master to apprentice**.

The most important parts of many crafts are difficult to communicate through text alone:

* Hand position
* Finger movement
* Timing
* Movement direction
* Relative positioning
* Repetition
* Technique

Although platforms such as YouTube provide enormous amounts of educational content, they are primarily **passive learning experiences**.

A learner may watch a craft tutorial but still struggle to answer:

> "Am I performing this movement correctly?"

At the same time, independent artists and traditional artisans often struggle with:

* Digital visibility
* Discoverability
* Reaching new learners
* Converting expertise into structured tutorials
* Preserving tacit knowledge

This creates a gap between **existing craft knowledge and modern digital learning.**

---

# ❓ Why Kalaverse?

The knowledge already exists.

The problem is **how that knowledge is discovered, taught, practiced, and preserved digitally.**

Kalaverse addresses both sides of the problem:

### For experts

It provides a digital space to:

* Build a profile
* Share their work
* Publish tutorials
* Teach learners
* Preserve structured craft knowledge

### For learners

It provides:

* Expert discovery
* Tutorial discovery
* Interactive practice
* Real-time hand tracking
* AI-generated guidance

---

# 💡 Solution

Kalaverse combines a social platform with interactive AR-assisted learning.

The basic learning cycle is:

```text
Expert Knowledge
       ↓
Structured Tutorial
       ↓
Learner Practice
       ↓
Webcam
       ↓
MediaPipe Hand Tracking
       ↓
Craft-specific Rule Engine
       ↓
Practice Result
       ↓
Gemini AI
       ↓
Human-readable Feedback
```

The expert remains the source of craft knowledge.

AI and computer vision act as **supporting tools** that help the learner practice.

---

# ✨ Key Features

## 👨‍🎨 1. Expert Profiles

Experts can create profiles containing:

* Name
* Profile image
* Craft/expertise
* Biography
* Experience
* Contact information
* Tutorials

---

## 📱 2. Social Feed

Experts and learners can create craft-related posts.

Posts can contain:

* Text
* Images
* Optional videos
* Author information
* Timestamp

This allows users to discover creators organically instead of treating the platform only as a course marketplace.

---

## 📚 3. Tutorial Publishing

Experts can create tutorials containing:

* Title
* Description
* Category
* Difficulty
* Free/Paid status
* Tutorial steps
* AR tracking actions

Example:

```text
Tutorial: Basic Weaving

Step 1:
Place your hand inside the starting area.

Tracking action:
HAND_IN_ZONE

Step 2:
Pinch the shuttle using your thumb
and index finger.

Tracking action:
PINCH

Step 3:
Move the shuttle from left to right.

Tracking action:
MOVE_RIGHT
```

---

# 🧑‍🎓 Learner Features

Learners can:

* Browse the social feed
* Discover experts
* Open expert profiles
* Browse tutorials
* Access free tutorials
* View paid tutorial information
* Start AR-assisted practice
* Receive feedback
* Share their learning progress

---

# 🖐️ Interactive AR Practice

The main technical feature of Kalaverse is the AR-assisted practice system.

The learner uses a webcam while following a tutorial.

The system observes hand movements and checks them against the expected action for the current tutorial step.

Example:

```text
Expected:
PINCH

Observed:
Thumb ↔ Index distance

Condition:
distance < threshold

Result:
PINCH DETECTED
```

The learner does not need special VR hardware.

A normal webcam is sufficient for the MVP.

---

# 🔍 How It Works

## Step-by-step

```text
1. Expert creates a tutorial
          ↓
2. Expert defines tutorial steps
          ↓
3. Each step receives a predefined tracking action
          ↓
4. Learner opens the tutorial
          ↓
5. Learner activates webcam
          ↓
6. MediaPipe detects hand landmarks
          ↓
7. Kalaverse evaluates the landmarks
          ↓
8. Craft-specific rule determines the result
          ↓
9. Gemini converts the result into feedback
          ↓
10. Learner corrects or proceeds
```

---

# 👨‍🎨 Expert Workflow

```text
Login / Entry
     ↓
Select "Expert"
     ↓
Expert Dashboard
     ↓
Create Profile
     ↓
Create Post
     ↓
Create Tutorial
     ↓
Add Tutorial Steps
     ↓
Select Tracking Action
     ↓
Publish Tutorial
```

## Example

An artisan wants to teach a basic weaving movement.

They create:

```text
Step 1
Instruction:
"Place your hand inside the starting zone."

Action:
HAND_IN_ZONE
```

Then:

```text
Step 2
Instruction:
"Pinch the shuttle between your thumb
and index finger."

Action:
PINCH
```

Then:

```text
Step 3
Instruction:
"Move the shuttle from left to right."

Action:
MOVE_RIGHT
```

The expert does not need to know how MediaPipe works.

They only select predefined actions that correspond to supported hand movements.

---

# 🧑‍🎓 Learner Workflow

```text
Login / Entry
     ↓
Select "Learner"
     ↓
Learner Feed
     ↓
Discover Expert
     ↓
Open Expert Profile
     ↓
Browse Tutorials
     ↓
Select Tutorial
     ↓
Start AR Practice
     ↓
Follow Instructions
     ↓
Receive Feedback
     ↓
Complete Tutorial
```

---

# 🖐️ MediaPipe Integration

Kalaverse uses **Google MediaPipe Hand Landmarker** for real-time hand tracking.

MediaPipe detects hand landmarks from the webcam feed.

A hand can be represented using a set of landmark points corresponding to important locations such as:

* Wrist
* Thumb
* Index finger
* Middle finger
* Ring finger
* Little finger

These landmarks provide the geometric information required by Kalaverse's tracking rules.

### Important Design Principle

MediaPipe does **not** understand the craft itself.

It only provides hand-tracking information.

Kalaverse's application logic interprets that information according to the tutorial.

---

# ⚙️ Craft Rule Engine

The rule engine connects the expert's instructions with computer vision.

For example:

```text
Expert Instruction
        ↓
"Pinch the shuttle"
        ↓
Tracking Action
        ↓
PINCH
        ↓
MediaPipe landmarks
        ↓
Calculate thumb-index distance
        ↓
Compare with threshold
        ↓
PINCH DETECTED / NOT DETECTED
```

Another example:

```text
Tracking Action:
MOVE_RIGHT

MediaPipe:
Previous hand X = 0.35
Current hand X  = 0.61

Result:
Movement direction = RIGHT
```

---

# 🤖 Gemini AI Integration

Gemini acts as the **AI feedback layer**.

It receives structured information rather than raw video.

For example:

```json
{
  "instruction": "Pinch the shuttle using your thumb and index finger.",
  "expected_action": "PINCH",
  "detected_action": "NO_PINCH",
  "status": "incorrect"
}
```

Gemini then generates a simple explanation for the learner.

Example:

```text
Bring your thumb and index finger
closer together and try the pinch again.
```

This separates the responsibilities of the system:

| Component   | Responsibility                                  |
| ----------- | ----------------------------------------------- |
| Expert      | Provides craft knowledge                        |
| MediaPipe   | Tracks hand landmarks                           |
| Rule Engine | Determines whether the expected action occurred |
| Gemini      | Explains the result to the learner              |
| Learner     | Performs and improves the technique             |

---

# 🔄 Feedback States

The AR system supports three primary states.

## ✅ Correct

The expected movement is detected.

```text
Action detected
      ↓
Step completed
      ↓
Positive feedback
      ↓
Next step
```

Example:

> Great! Your hand is in the correct position.

---

## ❌ Incorrect

The hand is visible, but the expected action is not detected.

```text
Action not detected
      ↓
Rule identifies mismatch
      ↓
Gemini generates correction
      ↓
Learner retries
```

Example:

> Bring your thumb and index finger closer together and try again.

---

## ⚠️ Uncertain

The system cannot reliably detect the hand.

For example:

* Hand is outside the camera frame
* Poor lighting
* Hand is partially blocked
* Tracking confidence is low

Instead of incorrectly marking the learner's action as wrong, the system asks the learner to reposition.

Example:

> I can't see your hand clearly. Move it into the camera area and try again.

---

# 🏗️ System Architecture

```text
                         KALAVERSE
                              │
              ┌───────────────┴───────────────┐
              │                               │
           EXPERT                          LEARNER
              │                               │
       Create Profile                   Create Profile
              │                               │
         Create Posts                   View Feed
              │                               │
       Create Tutorials                Discover Experts
              │                               │
       Define AR Steps                 View Tutorials
              │                               │
              └───────────────┬───────────────┘
                              │
                         REST API
                              │
                    ┌─────────┴─────────┐
                    │                   │
                Backend              Database
                    │                   │
                    │                MongoDB
                    │
          ┌─────────┴─────────┐
          │                   │
      MediaPipe            Gemini
          │                   │
   Hand Landmarks       AI Feedback
          │                   │
          └─────────┬─────────┘
                    │
              Learner Feedback
```

---

# 🧰 Technology Stack

## Frontend

* **React.js**
* **Vite**
* **Tailwind CSS**
* **React Router**
* JavaScript / TypeScript

## Backend

* **Node.js**
* **Express.js**
* REST APIs

## Database

* **MongoDB**
* MongoDB Atlas

## Computer Vision / AR

* **Google MediaPipe**
* Hand Landmarker
* Browser webcam APIs

## Generative AI

* **Google Gemini API**

Gemini is used for generating learner-friendly feedback from structured tutorial and tracking results.

## Media Storage

* Cloudinary or another suitable object-storage service

Used for:

* Profile images
* Post images
* Tutorial thumbnails
* Optional tutorial media

## Deployment

Possible deployment:

```text
Frontend → Vercel
Backend  → Render / Railway
Database → MongoDB Atlas
```

---

# 📁 Project Structure

A possible project structure is:

```text
kalaverse/
│
├── client/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── PostCard.jsx
│   │   │   ├── ExpertCard.jsx
│   │   │   ├── TutorialCard.jsx
│   │   │   └── FeedbackBox.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Entry.jsx
│   │   │   ├── ExpertDashboard.jsx
│   │   │   ├── LearnerDashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Feed.jsx
│   │   │   ├── Tutorial.jsx
│   │   │   └── ARPractice.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── ar/
│   │   │   ├── handTracker.js
│   │   │   ├── gestureRules.js
│   │   │   └── tutorialEngine.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── server/
│   │
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── services/
│   │   └── geminiService.js
│   │
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── README.md
├── .gitignore
└── .env.example
```

---

# 🗃️ Data Model

## User

```json
{
  "_id": "user_id",
  "name": "Anita Sharma",
  "role": "expert",
  "profileImage": "image_url",
  "bio": "Traditional embroidery artist",
  "craft": "Embroidery",
  "contact": {
    "email": "example@email.com",
    "phone": "XXXXXXXXXX"
  }
}
```

---

## Post

```json
{
  "_id": "post_id",
  "authorId": "user_id",
  "content": "Completed a traditional embroidery piece.",
  "media": [
    "image_url"
  ],
  "createdAt": "timestamp"
}
```

---

## Tutorial

```json
{
  "_id": "tutorial_id",
  "expertId": "user_id",
  "title": "Basic Weaving",
  "description": "Learn the fundamentals of weaving.",
  "category": "Weaving",
  "difficulty": "Beginner",
  "accessType": "free",
  "price": 0,
  "steps": []
}
```

---

## Tutorial Step

```json
{
  "stepNumber": 1,
  "instruction": "Pinch the shuttle using your thumb and index finger.",
  "trackingAction": "PINCH",
  "successCondition": {
    "threshold": 0.05
  }
}
```

---

# 🧠 Tutorial Step Logic

Tutorial steps are represented as structured data.

Example:

```json
{
  "stepNumber": 2,
  "instruction": "Move your hand from left to right.",
  "trackingAction": "MOVE_RIGHT"
}
```

The frontend loads the step.

The AR engine then executes:

```text
Load step
   ↓
Read trackingAction
   ↓
Activate corresponding rule
   ↓
Process MediaPipe landmarks
   ↓
Evaluate condition
   ↓
Return result
```

Example result:

```json
{
  "status": "success",
  "action": "MOVE_RIGHT",
  "confidence": 0.91
}
```

---

# 🔐 Authentication

Authentication is intentionally **not included in the initial MVP**.

The prototype uses a simple entry screen:

```text
Name
+
Role
```

The selected user is maintained during the session.

Authentication can be introduced later using:

* Firebase Authentication
* Google Sign-In
* JWT
* OAuth

This keeps the hackathon implementation focused on the core innovation.

---

# 💳 Paid Tutorials

The MVP supports the concept of free and paid tutorials.

Example:

```text
Tutorial:
Advanced Traditional Weaving

Access:
Paid

Price:
₹299
```

However, actual payment processing is outside the initial MVP.

A future implementation can integrate a payment provider and maintain:

```text
User
 ↓
Payment
 ↓
Purchase
 ↓
Tutorial Access
```

---

# 🚀 Installation

## 1. Clone the repository

```bash
git clone https://github.com/<your-username>/kalaverse.git
cd kalaverse
```

---

## 2. Install frontend dependencies

```bash
cd client
npm install
```

---

## 3. Install backend dependencies

Open another terminal:

```bash
cd server
npm install
```

---

# 🔑 Environment Variables

Create:

```text
server/.env
```

Example:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

GEMINI_API_KEY=your_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Never commit `.env` to GitHub.

Add it to `.gitignore`:

```text
.env
node_modules/
dist/
```

---

# ▶️ Running the Project

## Start Backend

```bash
cd server
npm run dev
```

Backend:

```text
http://localhost:5000
```

---

## Start Frontend

In another terminal:

```bash
cd client
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🧪 MVP Demo Flow

The recommended hackathon demonstration is:

### 1. Enter Kalaverse

Select:

```text
Name: Demo Expert
Role: Expert
```

### 2. Create Expert Profile

```text
Craft:
Traditional Weaving
```

### 3. Create Tutorial

```text
Basic Weaving Practice
```

Add steps:

```text
Step 1 → HAND_IN_ZONE
Step 2 → PINCH
Step 3 → MOVE_RIGHT
```

### 4. Switch to Learner

```text
Name: Demo Learner
Role: Learner
```

### 5. Discover Expert

Open the expert profile.

### 6. Open Tutorial

Select:

```text
Basic Weaving Practice
```

### 7. Start AR Practice

Enable webcam.

### 8. Perform Action

MediaPipe tracks the learner's hand.

### 9. Demonstrate Feedback

Correct action:

```text
✓ Step completed
```

Incorrect action:

```text
Try bringing your thumb and index finger closer.
```

### 10. Complete Tutorial

Show progress through the tutorial.

---

# 🎯 MVP Scope

The MVP focuses on proving the core concept rather than implementing a complete commercial platform.

## Included

* [x] User entry
* [x] Expert/Learner role selection
* [x] Expert profile
* [x] Learner profile
* [x] Social feed
* [x] Posts
* [x] Expert tutorial creation
* [x] Free/Paid tutorial classification
* [x] Structured tutorial steps
* [x] Predefined tracking actions
* [x] Webcam access
* [x] MediaPipe hand tracking
* [x] Basic gesture/action detection
* [x] Tutorial state machine
* [x] Gemini-generated feedback
* [x] Learner practice flow

## Not Included in MVP

* [ ] Full authentication
* [ ] Real payment gateway
* [ ] Advanced recommendation engine
* [ ] Complex multi-hand tracking
* [ ] Full 3D object recognition
* [ ] Automatic craft recognition
* [ ] Large-scale moderation
* [ ] Advanced analytics

---

# 🌱 Future Enhancements

Kalaverse can evolve beyond the initial MVP.

## 1. More Crafts

Support:

* Weaving
* Embroidery
* Pottery
* Painting
* Wood carving
* Traditional instrument techniques
* Jewelry making
* Sculpture
* Textile arts

---

## 2. Complex Gesture Recognition

The initial version can support simple actions such as:

```text
PINCH
MOVE_LEFT
MOVE_RIGHT
HAND_IN_ZONE
RELEASE
```

Future versions can support:

* Multi-step gestures
* Two-hand coordination
* Finger-specific movements
* Hand orientation
* Movement trajectories
* Timing
* Repetition

---

## 3. Object Tracking

Future versions can combine hand tracking with object detection.

For example:

```text
Hand + Needle + Thread
```

or:

```text
Hand + Pottery Tool + Clay
```

This could make the system more capable of understanding real craft interactions.

---

## 4. Personalized Learning

The platform could maintain learner progress.

For example:

```text
Learner
  ↓
Practice History
  ↓
Common Errors
  ↓
Difficulty Adjustment
  ↓
Personalized Practice
```

---

## 5. Expert Analytics

Experts could eventually see:

* Number of learners
* Tutorial completion rate
* Common mistakes
* Average practice attempts
* Learner progress

This could help artisans understand where learners struggle.

---

## 6. Expert Monetization

Experts could eventually earn through:

* Paid tutorials
* Live workshops
* One-to-one sessions
* Premium courses
* Digital craft resources

This creates a potential economic incentive for preserving and teaching traditional knowledge.

---

# ⚠️ Limitations

The MVP has several technical limitations.

### Hand tracking is not craft understanding

MediaPipe provides hand landmarks, not complete semantic understanding of a craft.

Therefore the MVP relies on predefined rules.

---

### Camera conditions affect tracking

Performance can be affected by:

* Poor lighting
* Occlusion
* Camera angle
* Background clutter
* Hand position
* Fast movements

---

### Complex crafts require more advanced tracking

A simple gesture such as a pinch is easier to detect than a complex weaving sequence involving:

* Two hands
* Multiple tools
* Objects
* Timing
* Repeated movements

These require more sophisticated computer-vision logic.

---

### AI feedback depends on structured input

Gemini should not be expected to independently determine whether a learner's hand movement was correct.

The recommended architecture is:

```text
Computer Vision
      ↓
Rule-based Verification
      ↓
Structured Result
      ↓
Gemini
      ↓
Natural-language Feedback
```

This reduces unnecessary hallucination and keeps the artisan's instructions central to the learning process.

---

# 🌍 Social Impact

Kalaverse is designed around the idea that technology should **preserve and amplify human creativity rather than replace it.**

Potential social benefits include:

### Cultural Preservation

Traditional techniques can be documented in structured digital tutorials.

### Accessibility

Learners can practice from anywhere using a standard webcam.

### Artist Visibility

Independent artists receive a dedicated space to showcase their work.

### Knowledge Transfer

Expert knowledge can reach learners beyond geographic boundaries.

### Economic Opportunities

Future monetization features can allow artisans to generate income from their expertise.

### Intergenerational Learning

Younger learners can interact with traditional knowledge using technology they are already comfortable with.

---

# 🔒 Design Philosophy

Kalaverse follows three principles.

## 1. Artist First

AI does not replace the artisan's expertise.

The artisan defines what should be taught.

---

## 2. Interactive Rather Than Passive

Instead of simply watching:

```text
Watch → Finish
```

Kalaverse aims for:

```text
Learn → Practice → Detect → Correct → Improve
```

---

## 3. Explain Rather Than Judge

The system should not simply tell a learner:

```text
Wrong.
```

It should explain:

```text
What went wrong
+
What to change
+
What to try next
```

---

# 🧩 Core Innovation

The core innovation of Kalaverse is not simply using AI or MediaPipe.

The key idea is connecting:

```text
Traditional Expert Knowledge
             +
     Structured Instructions
             +
      Hand Tracking
             +
      Craft-specific Rules
             +
       Generative AI
```

This transforms a traditional tutorial into an **interactive practice experience**.

The system bridges the gap between:

**"Watch someone perform a craft"**

and

**"Have a system guide me while I perform it."**

---

# 🔮 Long-Term Vision

Kalaverse aims to become a digital ecosystem where traditional knowledge can be:

```text
Discovered
    ↓
Documented
    ↓
Taught
    ↓
Practiced
    ↓
Preserved
    ↓
Passed to the next generation
```

The long-term vision is not to automate traditional art.

It is to ensure that **human craftsmanship remains discoverable, teachable, and economically sustainable in a digital world.**

---

# 🤝 Contributing

Contributions are welcome.

To contribute:

```bash
git clone https://github.com/<your-username>/kalaverse.git
cd kalaverse
git checkout -b feature/your-feature
```

Make your changes and commit:

```bash
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

Then open a Pull Request.

---

# 📄 License

This project is currently intended as a hackathon/project prototype.

Add an appropriate open-source license such as MIT if the project is intended to be publicly distributed.

---

# 👥 Team

**Kalaverse**

Built as a technology prototype exploring the intersection of:

* 🎨 Traditional Art
* 🤖 Generative AI
* 🖐️ Computer Vision
* 🌐 Social Learning
* 🧑‍🎨 Creator Empowerment

---

## ⭐ Final Concept

> **Kalaverse — where traditional knowledge meets interactive learning.**

**Preserve the craft.
Empower the creator.
Teach the next generation.**