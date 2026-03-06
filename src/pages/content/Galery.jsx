import InfiniteMenu from "../../components/ui/InfiniteMenu.jsx";
import Footer from "../../components/layout/Footer.jsx";
import TransparentNavigation from "../../components/layout/TransparentNavigation.jsx";
import { useTranslation } from "react-i18next";
import galeria1 from "../../assets/img/galeria1.png";
import galeria2 from "../../assets/img/galeria2.png";
import galeria3 from "../../assets/img/galeria3.png";
import galeria4 from "../../assets/img/galeria4.png";
import galeria5 from "../../assets/img/galeria5.jpg";
import galeria6 from "../../assets/img/galeria6.jpg";


function Galery() {
  const { t } = useTranslation('gallery');

  const items = [
    {
      image: galeria1,
      link: "",
      title: t('items.bandolas.title'),
      description: t('items.bandolas.description'),
    },
    {
      image: galeria2,
      link: "",
      title: t('items.plantaciones.title'),
      description: t('items.plantaciones.description'),
    },
    {
      image: galeria3,
      link: "",
      title: t('items.invernadero.title'),
      description: t('items.invernadero.description'),
    },
    {
      image: galeria4,
      link: "",
      title: t('items.naturaleza.title'),
      description: t('items.naturaleza.description'),
    },
    {
      image: galeria5,
      link: "",
      title: t('items.recoleccion.title'),
      description: t('items.recoleccion.description'),
    },
    {
      image: galeria6,
      link: "",
      title: t('items.tour.title'),
      description: t('items.tour.description'),
    },
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#1a1a1a] via-[#2d1810] to-[#1a1a1a]">
      {/* Menú transparente */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <TransparentNavigation />
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
