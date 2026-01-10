import bcrypt from "bcryptjs";

export const hashPassword = async(password)=>{
    try {
       const hashPassword =  await bcrypt.hash(password, 10)
       return hashPassword
    } catch (error) {
        console.log("Error hashing password:", error)
        throw new Error("Failed to hash password")

    }

}
export const comparePassword = async(password, hashedPassword)=>{
    return bcrypt.compare(password, hashedPassword)
}