import InfiniteMenu from "../components/InfiniteMenu.jsx";
import SecondNavigation from "../components/SecondNavigation.jsx";
import Footer from "../components/Footer.jsx";
import TrasparentNavigation from "../components/TrasparentNavigation.jsx";
import galeria1 from "../assets/img/galeria1.png";
import galeria2 from "../assets/img/galeria2.png";
import galeria3 from "../assets/img/galeria3.png";
import galeria4 from "../assets/img/galeria4.png";

function Galery() {
  const items = [
    {
      image: galeria1,
      link: "",
      title: "Bandolas de Café",
      description: "Accesorios esenciales para el café",
    },
    {
      image: galeria2,
      link: "",
      title: "Plantaciones de Café",
      description: "Nuestras plantas en la finca",
    },
    {
      image: galeria3,
      link: "",
      title: "Invernadero",
      description: "Cultivo controlado y sostenible",
    },
    {
      image: galeria4,
      link: "",
      title: "Naturaleza de la Finca",
      description: "La belleza del cultivo artesanal",
    },
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#1a1a1a] via-[#2d1810] to-[#1a1a1a]">
      {/* Menú transparente */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <TrasparentNavigation />
      </div>

      {/* Galería - ocupa el espacio disponible */}
      <div className="flex-1 w-full h-screen">
        <InfiniteMenu items={items} scale={1.0} />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Galery;
