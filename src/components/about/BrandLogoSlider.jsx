
import { useEffect, useState } from "react";
import "./BrandLogoSlider.css";


const WP_BASE_URL = "https://darkred-worm-224502.hostingersite.com/wp-json";

export default function BrandLogoSlider(){

    const [logos, setLogos] = useState([]);

    useEffect(()=>{
        const fatchBrands = async()=>{
            try {
                const response = await fetch(
                    // /wp/v2/brand-logo?_embed&per_page=100
                    `${WP_BASE_URL}/wp/v2/brand-logo?_embed&per_page=100`
                    // Simple Meaning:_embed = image/logo URL lane ke liye per_page=100 = ek baar me 100 logos
                );
                const brandimage = await response.json();
                // for formet - formattedLogos 
                const formattedLogos =brandimage.map((item)  =>({
                    id:      item.id,
                    title:   item.title.rendered,
                    image:   item._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "",
                    alt:     item._embedded?.["wp:featuredmedia"]?.[0]?.art_title || item.title.tendered,
                    
                }) );

                setLogos(formattedLogos);

            } catch (error) {
                console.log('Getting something error when geting brand logos:'. error);
                
            }
        };

        fatchBrands();
    },[]);    

        const logoDuplicaty = [...logos, ...logos];


        if(!logos.length) return null;
    return(
        <>
        <div className="brand-logo-main">
            <section className="brand-logo-section">
                <div className="brand-logo-wrapper">
                    <div className="brand-logo-track">
                    {logoDuplicaty.map((logo, index) => (
                        <div className="brand-logo-item" key={`${logo.id}-${index}`}>
                        <img src={logo.image} alt={logo.alt} loading="lazy" />
                        </div>
                    ))}
                    {/* created by pranshu singh 😊 */}
                    </div>
                </div>
            </section>
        </div>
        </>
    )
}