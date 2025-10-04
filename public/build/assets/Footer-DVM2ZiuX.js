import{r as h,j as e,m as s,L as t,a8 as r,l as y}from"./main-9L8j6t2k.js";import{F as u,T as p}from"./facebook-BxqFtT1u.js";import{f as b,a as v}from"./FdcLogoBlack-zHzX5pB1.js";import{C as k}from"./copyright-DoDxpFWZ.js";const f="/build/assets/instagram-B714XD8Y.svg",j="/build/assets/phone-DZiX-Iuo.svg",w="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.697486822452!2d7.47294477508003!3d9.006972291079313!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e76c1256372d3%3A0x6b72a088921200ab!2sIyemi%20Plaza%2C%20Ebeano%20Rd%2C%20Gudu%20District%2C%20Abuja%2C%20Federal%20Capital%20Territory%20900105%2C%20Abuja%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1700684251390!5m2!1sen!2sus",N=({src:a})=>e.jsx("div",{className:"w-full pb-6 h-64 sm:h-80 rounded-xl overflow-hidden shadow-md dark:shadow-xl",children:e.jsx("iframe",{src:a,width:"100%",height:"100%",style:{border:0},allowFullScreen:"",loading:"lazy",referrerPolicy:"no-referrer-when-downgrade",title:"FirstSmart Mart Location"})}),S=()=>{const[a,l]=h.useState(()=>{const i=localStorage.getItem("theme");return i==="light"?!1:i==="dark"?!0:window.matchMedia("(prefers-color-scheme: dark)").matches});h.useEffect(()=>{const i=()=>{const n=localStorage.getItem("theme");l(n==="dark")};window.addEventListener("storage",i);const c=new MutationObserver(n=>{n.forEach(g=>{if(g.attributeName==="class"){const d=document.documentElement.classList.contains("dark");d!==a&&l(d)}})});return c.observe(document.documentElement,{attributes:!0}),()=>{window.removeEventListener("storage",i),c.disconnect()}},[a]);const m=new Date().getFullYear(),o={hidden:{opacity:0,y:20},visible:{opacity:1,y:0}},x={hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:.08,delayChildren:.1}}};return e.jsxs(s.footer,{className:`w-full p-6 text-gray-700
                         bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 /* Light mode gradient: soft, inviting grays */
                         dark:text-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950`,variants:x,initial:"hidden",animate:"visible",children:[e.jsxs("div",{className:"absolute inset-0 pointer-events-none z-0 opacity-50 dark:opacity-30",children:[e.jsx("div",{className:"absolute top-[20%] left-[10%] w-64 h-64 bg-blue-300/30 rounded-full blur-3xl dark:bg-cyan-500/10"}),e.jsx("div",{className:"absolute bottom-[15%] right-[15%] w-72 h-72 bg-fuchsia-300/30 rounded-full blur-3xl dark:bg-purple-500/10"})]}),e.jsxs("div",{className:"container mx-auto px-4 relative z-10",children:[e.jsxs("div",{className:`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12
                                 border-b border-gray-300 /* Light mode border: subtle gray */
                                 dark:border-gray-700`,children:[" ",e.jsxs(s.div,{variants:o,children:[e.jsx(t,{to:"/",className:"inline-block mb-4",children:e.jsx("img",{src:a?b:v,alt:"FirstSmart Mart",className:`${a?"h-10 w-auto":"h-12 w-auto"}`})}),e.jsxs("p",{className:`text-sm leading-relaxed mb-4
                                     text-gray-600 /* Light mode text: darker gray for readability */
                                     dark:text-gray-200`,children:[" ","Your ultimate destination for cutting-edge electronics and smart innovations. Experience the future, today."]}),e.jsxs("div",{className:"flex space-x-4",children:[e.jsxs("a",{href:"https://facebook.com",target:"_blank",rel:"noopener noreferrer","aria-label":"Facebook",className:`w-8 h-8 flex items-center justify-center rounded-full transition-all p-1
                                         bg-gray-200 hover:bg-blue-500 text-gray-700 hover:text-white /* Light mode social icon background/text/hover */
                                         dark:bg-gray-700 dark:hover:bg-blue-600 dark:text-white`,children:[" ",e.jsx("img",{src:u,alt:"Facebook",className:"w-5 h-5"})]}),e.jsxs("a",{href:"https://instagram.com/firstdigits",target:"_blank",rel:"noopener noreferrer","aria-label":"Instagram",className:`w-8 h-8 flex items-center justify-center rounded-full transition-all p-1
                                         bg-gray-200 hover:bg-pink-500 text-gray-700 hover:text-white /* Light mode social icon background/text/hover */
                                         dark:bg-gray-700 dark:hover:bg-pink-600 dark:text-white`,children:[" ",e.jsx("img",{src:f,alt:"Instagram",className:"w-5 h-5"})]}),e.jsxs("a",{href:"https://x.com",target:"_blank",rel:"noopener noreferrer","aria-label":"X (Twitter)",className:`w-8 h-8 flex items-center justify-center rounded-full transition-all p-1
                                         bg-gray-200 hover:bg-gray-700 text-gray-700 hover:text-white /* Light mode social icon background/text/hover */
                                         dark:bg-gray-700 dark:hover:bg-gray-400 dark:text-white`,children:[" ",e.jsx("img",{src:p,alt:"X (Twitter)",className:"w-5 h-5"})]}),e.jsxs("a",{href:"tel:+2347052500468","aria-label":"Phone",className:`w-8 h-8 flex items-center justify-center rounded-full transition-all p-1
                                         bg-gray-200 hover:bg-green-500 text-gray-700 hover:text-white /* Light mode social icon background/text/hover */
                                         dark:bg-gray-700 dark:hover:bg-green-600 dark:text-white`,children:[" ",e.jsx("img",{src:j,alt:"Phone",className:"w-5 h-5"})]})]})]}),e.jsxs(s.div,{variants:o,children:[e.jsx("h3",{className:`text-xl font-bold mb-6
                                     text-gray-900 /* Light mode header text: dark gray */
                                     dark:text-white`,children:"Quick Links"}),e.jsxs("ul",{className:"space-y-3",children:[e.jsx("li",{children:e.jsxs(t,{to:"/shop",className:`text-base flex items-center group transition-colors
                                             hover:text-blue-600 /* Light mode link hover */
                                             dark:hover:text-cyan-400`,children:[" ",e.jsx(r,{className:`w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity
                                                     text-blue-400 /* Light mode arrow color */
                                                     dark:text-cyan-400`})," Shop All"]})}),e.jsx("li",{children:e.jsxs(t,{to:"/collections/trending",className:`text-base flex items-center group transition-colors
                                             hover:text-blue-600 /* Light mode link hover */
                                             dark:hover:text-cyan-400`,children:[" ",e.jsx(r,{className:`w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity
                                                     text-blue-400 /* Light mode arrow color */
                                                     dark:text-cyan-400`})," Trending Products"]})}),e.jsx("li",{children:e.jsxs(t,{to:"/collections/new-arrival",className:`text-base flex items-center group transition-colors
                                             hover:text-blue-600 /* Light mode link hover */
                                             dark:hover:text-cyan-400`,children:[" ",e.jsx(r,{className:`w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity
                                                     text-blue-400 /* Light mode arrow color */
                                                     dark:text-cyan-400`})," New Arrival"]})}),e.jsx("li",{children:e.jsxs(t,{to:"/about",className:`text-base flex items-center group transition-colors
                                             hover:text-blue-600 /* Light mode link hover */
                                             dark:hover:text-cyan-400`,children:[" ",e.jsx(r,{className:`w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity
                                                     text-blue-400 /* Light mode arrow color */
                                                     dark:text-cyan-400`})," About Us"]})}),e.jsx("li",{children:e.jsxs(t,{to:"/contact",className:`text-base flex items-center group transition-colors
                                             hover:text-blue-600 /* Light mode link hover */
                                             dark:hover:text-cyan-400`,children:[" ",e.jsx(r,{className:`w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity
                                                     text-blue-400 /* Light mode arrow color */
                                                     dark:text-cyan-400`})," Contact"]})})]})]}),e.jsxs(s.div,{variants:o,children:[e.jsx("h3",{className:`text-xl font-bold mb-6
                                     text-gray-900 /* Light mode header text: dark gray */
                                     dark:text-white`,children:"Support"}),e.jsxs("ul",{className:"space-y-3",children:[e.jsx("li",{children:e.jsxs(t,{to:"/support/faq",className:`text-base flex items-center group transition-colors
                                             hover:text-blue-600 /* Light mode link hover */
                                             dark:hover:text-cyan-400`,children:[" ",e.jsx(r,{className:`w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity
                                                     text-blue-400 /* Light mode arrow color */
                                                     dark:text-cyan-400`})," FAQ"]})}),e.jsx("li",{children:e.jsxs(t,{to:"/support/shipping-returns",className:`text-base flex items-center group transition-colors
                                             hover:text-blue-600 /* Light mode link hover */
                                             dark:hover:text-cyan-400`,children:[" ",e.jsx(r,{className:`w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity
                                                     text-blue-400 /* Light mode arrow color */
                                                     dark:text-cyan-400`})," Shipping & Returns"]})}),e.jsx("li",{children:e.jsxs(t,{to:"/support/warranty",className:`text-base flex items-center group transition-colors
                                             hover:text-blue-600 /* Light mode link hover */
                                             dark:hover:text-cyan-400`,children:[" ",e.jsx(r,{className:`w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity
                                                     text-blue-400 /* Light mode arrow color */
                                                     dark:text-cyan-400`})," Warranty"]})}),e.jsx("li",{children:e.jsxs(t,{to:"/privacy",className:`text-base flex items-center group transition-colors
                                             hover:text-blue-600 /* Light mode link hover */
                                             dark:hover:text-cyan-400`,children:[" ",e.jsx(r,{className:`w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity
                                                     text-blue-400 /* Light mode arrow color */
                                                     dark:text-cyan-400`})," Privacy Policy"]})}),e.jsx("li",{children:e.jsxs(t,{to:"/terms",className:`text-base flex items-center group transition-colors
                                             hover:text-blue-600 /* Light mode link hover */
                                             dark:hover:text-cyan-400`,children:[" ",e.jsx(r,{className:`w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity
                                                     text-blue-400 /* Light mode arrow color */
                                                     dark:text-cyan-400`})," Terms of Service"]})})]})]}),e.jsxs(s.div,{variants:o,children:[e.jsx("h3",{className:`text-xl font-bold mb-6
                                     text-gray-900 /* Light mode header text: dark gray */
                                     dark:text-white`,children:"Our Location"}),e.jsxs("p",{className:`leading-relaxed mb-6 flex items-start
                                     text-gray-600 /* Light mode text: darker gray */
                                     dark:text-gray-300`,children:[" ",e.jsx(y,{className:`w-5 h-5 mr-3 mt-1 flex-shrink-0
                                             text-gray-500 /* Light mode icon color: medium gray */
                                             dark:text-gray-400`})," ","B33 First Floor, Iyemi Plaza, Along Ebeano road, Gudu District Abuja"]}),e.jsx(N,{src:w})]})]}),e.jsxs(s.div,{variants:o,className:`pt-8 text-center text-sm
                                             text-gray-500 /* Light mode text: medium gray */
                                             dark:text-gray-500`,children:[" ",e.jsxs("div",{className:"flex items-center justify-center mb-2",children:[e.jsx(k,{className:`w-4 h-4 mr-2
                                             text-gray-500 /* Light mode icon color */
                                             dark:text-gray-500`}),e.jsxs("span",{children:["Copyright © ",m," All rights reserved."]})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row text-center justify-center gap-4 sm:gap-10 mt-4",children:[e.jsxs(t,{to:"/terms",className:`transition-colors
                                     text-gray-500 hover:text-blue-600 /* Light mode link/hover */
                                     dark:text-gray-400 dark:hover:text-blue-400`,children:[" ","Terms of Use"]}),e.jsxs(t,{to:"/privacy",className:`transition-colors
                                     text-gray-500 hover:text-blue-600 /* Light mode link/hover */
                                     dark:text-gray-400 dark:hover:text-blue-400`,children:[" ","Privacy Notice"]})]}),e.jsxs("div",{className:"mt-8 flex justify-center flex-wrap gap-3",children:[e.jsx("img",{src:"https://img.icons8.com/color/48/000000/visa.png",alt:"Visa",className:"h-8"}),e.jsx("img",{src:"https://img.icons8.com/color/48/000000/mastercard.png",alt:"Mastercard",className:"h-8"}),e.jsx("img",{src:"https://img.icons8.com/color/48/000000/paypal.png",alt:"PayPal",className:"h-8"})]})]})]})]})};export{S as default};
