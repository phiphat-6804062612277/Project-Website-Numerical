# NumeriCraft: Linear System Matrix Solver

เว็บแอปพลิเคชันคำนวณและแสดงขั้นตอนวิธีทำระบบสมการเชิงเส้น ($Ax = b$) ทีละสเต็ป (Step-by-Step Visualizer) พัฒนาด้วยสถาปัตยกรรมเชิงวัตถุ (Object-Oriented Programming: OOP)

**วิชา:** 040613204 Object-Oriented Programming  
**ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ คณะวิทยาศาสตร์ประยุกต์**  
**มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ (KMUTNB)**

---

## 🚀 ฟีเจอร์หลัก (Features)
- **รองรับขนาดเมทริกซ์ยืดหยุ่น:** รองรับทั้ง $2 \times 2, 3 \times 3,$ และ $4 \times 4$
- **3 อัลกอริทึมมาตรฐาน:**
  1. **Gauss-Jordan Elimination:** แปลงเป็น Reduced Row Echelon Form (RREF) พร้อม Partial Pivoting
  2. **Gauss Elimination:** ทำ Upper Triangular Matrix และการแทนค่าย้อนกลับ (Backward Substitution)
  3. **Cramer's Rule:** คำนวณผ่านอัตราส่วนของดีเทอร์มิแนนต์
- **Interactive Step-by-Step:** แสดงขั้นตอนการแปลงแถว (Row Operations) ทีละขั้น พร้อมตารางเมทริกซ์และสูตร LaTeX Math สวยงามผ่าน KaTeX
- **ระบบตรวจจับข้อผิดพลาด:** ตรวจสอบ $\det(A) = 0$ (เมทริกซ์เอกฐาน) อัตโนมัติ
- **ระบบประวัติบนคลาวด์:** บันทึกประวัติโจทย์ลงฐานข้อมูล MongoDB Atlas (พร้อมระบบ In-Memory สำรองเมื่อใช้งานแบบ Local)

---

## 🏛️ โครงสร้างการออกแบบเชิงวัตถุ (OOP Architecture)

```
+-------------------------------------------------------+
|                 <<abstract>> Problem                  |
+-------------------------------------------------------+
| # id: string                                          |
| # userId: string                                      |
| # problemType: ProblemType                            |
| # rawInput: string                                    |
| # createdAt: Date                                     |
+-------------------------------------------------------+
| + getId(): string                                     |
| + formatInput(): boolean*                             |
+-------------------------------------------------------+
                           ▲
                           | Inheritance
+-------------------------------------------------------+
|                  LinearSystemProblem                  |
+-------------------------------------------------------+
| - matrixA: number[][]                                 |
| - vectorB: number[]                                   |
| - dimension: number                                   |
+-------------------------------------------------------+
| + getMatrixA(): number[][]                            |
| + getVectorB(): number[]                              |
| + getDimension(): number                              |
| + getDeterminant(): number                            |
| + isSingular(): boolean                               |
+-------------------------------------------------------+
                           ◆ Composition (has-a)
                           |
+-------------------------------------------------------+
|              <<abstract>> LinearSystemSolver          |
+-------------------------------------------------------+
| # solverId: string                                    |
| # problem: LinearSystemProblem                        |
| # solutionType: SolutionType                          |
| # steps: StepLog[]                                    |
| # answers: number[]                                   |
+-------------------------------------------------------+
| + solve(): SolutionResult*                            |
| + getSteps(): StepLog[]                               |
| # logStep(title, desc, matrix, latex, type): void     |
| + toLaTeXMatrix(matrix): string                       |
+-------------------------------------------------------+
        ▲                       ▲                    ▲
        |                       |                    | Inheritance
+-------------------+   +------------------+   +----------------+
| GaussJordanSolver |   | GaussElimination |   |  CramerSolver  |
+-------------------+   +------------------+   +----------------+
| + solve()         |   | + solve()        |   | + solve()      |
+-------------------+   +------------------+   +----------------+
```

### การประยุกต์ใช้ 5 เสาหลักของ OOP:
1. **Inheritance (การสืบทอด):** `LinearSystemProblem` สืบทอดจาก `Problem` และ Solver ทั้งหมดสืบทอดจาก `LinearSystemSolver`
2. **Polymorphism (ภาวะพหุสัณฐาน):** เรียกใช้ผ่าน `SolverFactory.createSolver()` โดยสั่ง `solver.solve()` ตัวระบบจะประมวลผลตามขั้นตอนเฉพาะของคลาสลูกนั้นๆ
3. **Composition (การประกอบกัน):** `LinearSystemSolver` มี Attribute ภายในเป็น `problem: LinearSystemProblem`
4. **Encapsulation (การห่อหุ้ม):** เมทริกซ์และเวกเตอร์ถูกประกาศเป็น `private` เข้าถึงผ่าน Getter และ Validation ป้องกันการแก้ไขตรง
5. **Constructor & Super:** คลาสลูกเรียก `super(...)` ส่งผ่านคุณลักษณะไปยังคลาสแม่

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
- **Frontend / Backend:** Next.js 15 (App Router, React 19, TypeScript)
- **Styling:** Tailwind CSS (Light Theme)
- **Math Rendering:** KaTeX
- **Icons:** Lucide React
- **Database:** MongoDB (MongoDB Atlas)
- **Deployment:** Vercel

---

## 💻 วิธีการรันโปรเจกต์ในเครื่อง (Getting Started)

1. **ติดตั้ง dependencies:**
   ```bash
   npm install
   ```

2. **รัน Development Server:**
   ```bash
   npm run dev
   ```
   เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

3. **ตั้งค่าฐานข้อมูล MongoDB (ตัวเลือก):**
   คัดลอกไฟล์ `.env.example` เป็น `.env.local` แล้วใส่ MongoDB Connection String:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
   ```
   *(หากไม่ใส่ ระบบจะใช้ In-Memory Database สำรองให้อัตโนมัติ)*

4. **Build เพื่อเตรียม Deploy:**
   ```bash
   npm run build
   ```
