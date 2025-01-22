const webhookURL="https://discordapp.com/api/webhooks/1331704944381788222/EQg22MlwJ6v37kPBvvViDessUfXv80wZoUwAeB7pNe7K56HDPYpaQh-u96GSaPLiESiK",form=document.getElementById("fichajeForm"),historial=document.getElementById("historial"),cargarFichajes=()=>{let a=JSON.parse(localStorage.getItem("fichajes"))||[];historial.innerHTML="",a.forEach((a,e)=>{let r=document.createElement("tr");r.innerHTML=`
            <td>${a.nombre}</td>
            <td>${a.fecha}</td>
            <td>${a.horaEntrada||"-"}</td>
            <td>${a.horaSalida||"-"}</td>
            <td>${a.horasTrabajadas||"-"}</td>
            <td id="tiempo-${e}">${a.horaSalida?"-":"0:00:00"}</td>
        `,historial.appendChild(r),a.horaSalida||iniciarContador(e,a.horaEntrada)})},iniciarContador=(a,e)=>{let r=document.getElementById(`tiempo-${a}`),t=new Date(`${new Date().toLocaleDateString()} ${e}`),o=()=>{let a=new Date,e=a-t,o=Math.floor(e/36e5),i=Math.floor(e%36e5/6e4),n=Math.floor(e%6e4/1e3);r.textContent=`${o}:${i.toString().padStart(2,"0")}:${n.toString().padStart(2,"0")}`};setInterval(o,1e3),o()},enviarLogADiscord=async(a,e,r,t,o)=>{let i={content:`Registro de fichaje:
- **Nombre**: ${a}
- **Fecha**: ${e}
- **Hora de Entrada**: ${r}
- **Hora de Salida**: ${t||"-"}
- **Horas Trabajadas**: ${o||"-"}`};try{let n=await fetch("https://discordapp.com/api/webhooks/1331704944381788222/EQg22MlwJ6v37kPBvvViDessUfXv80wZoUwAeB7pNe7K56HDPYpaQh-u96GSaPLiESiK",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)});n.ok||console.error("Error al enviar el log a Discord:",n.statusText)}catch(d){console.error("Error al conectar con Discord:",d)}},guardarFichaje=a=>{let e=new Date,r=e.toLocaleDateString(),t=e.toLocaleTimeString(),o=JSON.parse(localStorage.getItem("fichajes"))||[],i=o.find(e=>e.nombre===a&&!e.horaSalida);if(i){i.horaSalida=t;let n=new Date(`${r} ${i.horaEntrada}`),d=new Date(`${r} ${t}`),s=((d-n)/36e5).toFixed(2);i.horasTrabajadas=`${s} horas`,enviarLogADiscord(a,r,i.horaEntrada,i.horaSalida,i.horasTrabajadas)}else{let l={nombre:a,fecha:r,horaEntrada:t,horaSalida:null,horasTrabajadas:null};o.push(l),enviarLogADiscord(a,r,t,null,null)}localStorage.setItem("fichajes",JSON.stringify(o)),cargarFichajes()};form.addEventListener("submit",a=>{a.preventDefault();let e=document.getElementById("nombre").value.trim();e?(guardarFichaje(e),form.reset()):alert("Por favor, introduce tu nombre.")}),cargarFichajes();
