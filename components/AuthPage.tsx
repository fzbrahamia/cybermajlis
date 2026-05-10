// //THIS PAGE IS REDUNDANT NOW. LOGIN AND SIGNUP HANDLED IN STEPPERFLOW.TSX
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";

// type Character = {
//   id: string;
//   name: string;
//   role: string;
//   image: string;
//   story: string;
//   famousLine: string;
// };

// const characters: Character[] = [
//   {
//     id: "oryx",
//     name: "Arabian Oryx",
//     role: "Risk Assessor / Planner",
//     image: "/characters/oryx.jpeg",
//     story: "Grew up exploring the Qatari desert, always mapping safe paths for friends.",
//     famousLine: "“Let’s pause… the safest path isn’t always the fastest.”",
//   },
//   {
//     id: "fox",
//     name: "Red Fox",
//     role: "Forensics / Investigator",
//     image: "/characters/fox.jpeg",
//     story: "Solved the mystery of the disappearing data bytes as a cub.",
//     famousLine: "“There’s always a clue… if you look closely.”",
//   },
//   {
//     id: "falcon",
//     name: "Saker Falcon",
//     role: "Threat Detection",
//     image: "/characters/falcon.jpeg",
//     story: "Once spotted a cyber threat from miles away, saving the whole village server.",
//     famousLine: "“My eyes see everything, even hidden threats.”",
//   },
//   {
//     id: "camel",
//     name: "Camel",
//     role: "Support / Resilience",
//     image: "/characters/camel.jpeg",
//     story: "Survived countless sandstorms by staying steady and calm.",
//     famousLine: "“It’s okay! We get back up, stronger.”",
//   },
// ];

// export default function AuthPage() {
//   const [isLogin, setIsLogin] = useState(true);
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     username: "",
//     nickname: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });
//   const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

//   const router = useRouter();

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleLogin = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.email || !formData.password) {
//       alert("Please fill in all fields!");
//       return;
//     }
//     router.push("/dashboard");
//   };

//   const handleSignup = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.username || !formData.nickname || !formData.email || !formData.password || !formData.confirmPassword) {
//       alert("Please fill in all fields!");
//       return;
//     }
//     if (formData.password !== formData.confirmPassword) {
//       alert("Passwords do not match!");
//       return;
//     }
//     setStep(2);
//   };

//   const handleConfirmCharacter = () => {
//     if (!selectedCharacter) {
//       alert("Please select a character!");
//       return;
//     }
//     router.push("/dashboard");
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#25344F] text-white px-4">
//       <div className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-[#617891]">
//         {/* Step 1: Login / Signup */}
//         {step === 1 && (
//           <>
//             <div className="flex justify-between mb-6">
//               <button
//                 className={`w-1/2 py-2 rounded-l-lg font-semibold ${isLogin ? "bg-[#632024]" : "bg-white text-black"}`}
//                 onClick={() => setIsLogin(true)}
//               >
//                 Login
//               </button>
//               <button
//                 className={`w-1/2 py-2 rounded-r-lg font-semibold ${!isLogin ? "bg-[#632024]" : "bg-white text-black"}`}
//                 onClick={() => setIsLogin(false)}
//               >
//                 Sign Up
//               </button>
//             </div>

//             {isLogin ? (
//               <form onSubmit={handleLogin} className="space-y-4">
//                 <input
//                   type="email"
//                   name="email"
//                   placeholder="Email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 rounded-lg bg-white text-black focus:outline-none"
//                 />
//                 <input
//                   type="password"
//                   name="password"
//                   placeholder="Password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 rounded-lg bg-white text-black focus:outline-none"
//                 />
//                 <button
//                   type="submit"
//                   className="w-full py-2 rounded-lg bg-[#632024] text-white font-semibold hover:opacity-90"
//                 >
//                   Login
//                 </button>
//               </form>
//             ) : (
//               <form onSubmit={handleSignup} className="space-y-4">
//                 <input
//                   type="text"
//                   name="username"
//                   placeholder="Username"
//                   value={formData.username}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 rounded-lg bg-white text-black focus:outline-none"
//                 />
//                 <input
//                   type="text"
//                   name="nickname"
//                   placeholder="Nickname"
//                   value={formData.nickname}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 rounded-lg bg-white text-black focus:outline-none"
//                 />
//                 <input
//                   type="email"
//                   name="email"
//                   placeholder="Email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 rounded-lg bg-white text-black focus:outline-none"
//                 />
//                 <input
//                   type="password"
//                   name="password"
//                   placeholder="Password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 rounded-lg bg-white text-black focus:outline-none"
//                 />
//                 <input
//                   type="password"
//                   name="confirmPassword"
//                   placeholder="Confirm Password"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 rounded-lg bg-white text-black focus:outline-none"
//                 />

//                 <button
//                   type="submit"
//                   className="w-full py-2 rounded-lg bg-[#632024] text-white font-semibold hover:opacity-90"
//                 >
//                   Next →
//                 </button>
//               </form>
//             )}
//           </>
//         )}

//         {/* Step 2: Character Selection */}
//         {step === 2 && (
//           <div>
//             <h2 className="text-xl font-bold mb-4 text-center">Choose Your Character</h2>
//             <div className="grid grid-cols-2 gap-4">
//               {characters.map((char) => {
//                 const isSelected = selectedCharacter?.id === char.id;
//                 return (
//                   <div
//                     key={char.id}
//                     className={`p-3 rounded-lg border cursor-pointer transition-all duration-500
//                       ${isSelected ? "border-[#632024] bg-[#25344F]" : "border-transparent bg-[#D5B893] text-black"}
//                       hover:scale-105`}
//                     onClick={() => setSelectedCharacter(char)}
//                   >
//                     {/* Always visible: name + image */}
//                     <Image
//                       src={char.image}
//                       alt={char.name}
//                       width={80}
//                       height={80}
//                       className="rounded-full mx-auto mb-2"
//                     />
//                     <h3 className="font-semibold text-center">{char.name}</h3>

//                     {/* Reveal full details only when selected */}
//                     <div
//                       className={`mt-2 transition-all duration-500 ease-out overflow-hidden
//                         ${isSelected ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}
//                     >
//                       <p className="text-sm text-center italic mb-1">{char.role}</p>
//                       <p className="text-xs text-center mb-1">{char.story}</p>
//                       <p className="text-xs text-center font-semibold">"{char.famousLine}"</p>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             <button
//             onClick={handleConfirmCharacter}
//             className={`mt-6 w-full py-2 rounded-lg font-semibold transition-all duration-300
//                 ${
//                 selectedCharacter
//                     ? "bg-[#632024] text-white hover:bg-[#7A2E2D] hover:scale-105 cursor-pointer"
//                     : "bg-gray-400 cursor-not-allowed"
//                 }`}
//             disabled={!selectedCharacter}
//             >
//             Confirm Character
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
