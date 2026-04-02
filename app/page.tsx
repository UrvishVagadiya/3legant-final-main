import ImageSlider from '@/components/sections/ImageSlider'
import InfoSection from '@/components/sections/InfoSection'
import Cards from '@/components/ui/Cards'
import About from '@/components/sections/About'
import Ads from '@/components/sections/Ads'
import Artical from '@/components/sections/Artical'
import Arrivals from '@/components/sections/Arrivals'


const Home = () => {
  return (
    <div className="w-full">
      <ImageSlider/>
      <InfoSection/>
      <Cards/>
      <Arrivals/>
      <About/>
      <Ads/>
      <Artical/>
      
    </div>
  )
}

export default Home