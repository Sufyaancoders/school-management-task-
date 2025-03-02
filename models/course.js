const mongoes=require('mongoose');

const courseSchema=new mongoes.Schema({
    name: {
        type: String,
        required: [true, "Course name is required"],
        trim: true,
        unique: true, // Ensures unique course names

      },
      branch: {
        type: String,
        required: [true, "Branch is required"],
        trim: true,
      },
      HOD: {
        type: String,
        required: [true, "HOD name is required"],
        trim: true,
      },
    
});

module.exports=mongoes.model("Course", courseSchema);

// In your backend course controller (courseController.js or similar)
const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, branch, HOD, oldName } = req.body;

        // First update the course
        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            { name, branch, HOD },
            { new: true }
        );

        // Then update all students who have this course
        if (oldName && oldName !== name) {
            await Student.updateMany(
                { courseName: oldName },
                { courseName: name }
            );
        }

        res.json(updatedCourse);
    } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({ message: error.message });
    }
};
