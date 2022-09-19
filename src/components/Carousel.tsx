import type { ParentComponent } from "solid-js";
import { Slider, SliderProvider, SliderButton } from "solid-slider";

const Carousel: ParentComponent = ({ children }) => {
  return (
    <SliderProvider>
      <Slider options={{ loop: true }}>{children}</Slider>
      <SliderButton prev>Previous</SliderButton>
      <SliderButton next>Next</SliderButton>
    </SliderProvider>
  );
};

export default Carousel;
