'use client'

import React from 'react'
import Select from 'react-select'
import axios from 'axios';

class Champion {
  label: string;
  value: string;
  imagePath: string;

  constructor(label: string, value: string, imagePath: string) {
    this.label = label;
    this.value = value;
    this.imagePath = imagePath;
  }

  getName() {
    return this.label;
  }

  getSlug() {
    return this.value;
  }

  getImagePath() {
    return this.imagePath;
  }
}

export default function Home() {
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [championsList, setChampionsList] = React.useState([] as Champion[]);
  const [elementsList, setElementsList] = React.useState([] as Champion[]);
  const [selectedChampion, setSelectedChampion] = React.useState<string>('');
  const [selectedElement, setSelectedElement] = React.useState<string>('');
  const [imageUri1, setImageUri1] = React.useState<string>('https://d2alzja70szp8g.cloudfront.net/lorraine-wandering-warrior-doa-alter.png');
  const [imageUri2, setImageUri2] = React.useState<string>('https://d2alzja70szp8g.cloudfront.net/lost-spirit-demo22.png');

  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const fetchData = async() => {
    try {
      let championsList : Champion[] = [];
      let elementsList : Champion[] = [];
      
      let response = await axios.get('api/fetchCards');
      let allChampions = response.data.data;

      allChampions?.forEach((champion: Record<string, unknown>) => {
        let cardEditions: Record<string, unknown>[] = champion.editions as Record<string, unknown>[];
        let cardName: string = champion.name as string;
        let cardSlug: string = cardEditions[0].slug as string;
        let cardLevel: string = champion.level as string;
        let cardRarity: number = cardEditions[0].rarity as number ?? 0;
        let cardImagePath: string = cardEditions[0].image as string;

        // Removes prize cards from list
        if(cardRarity < 8) {
          if(cardLevel == '0') {
            elementsList.push(new Champion(cardName, cardSlug, cardImagePath));
          }
          else if(cardName != 'Nameless Champion') {
            championsList.push(new Champion(cardName, cardSlug, cardImagePath));
          }
        }
      });

      if(isLoading) {
        setChampionsList(championsList);
        setElementsList(elementsList);

        // Set initial states
        setSelectedChampion(addUnderscore(championsList[0].getName()));
        setSelectedElement(addUnderscore(elementsList[0].getName()));
        setImageUri1(await generateImageUri(championsList[0].getImagePath()));
        setImageUri2(await generateImageUri(elementsList[0].getImagePath()));

        setIsLoading(false);
      }
    }
    catch(error : any) {
      console.error('Failed to fetch card data from api.gatcg.com: ' + error);
    }
  }

  function addUnderscore(name : string) {
    return name.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'').split(' ').join('_');
  }

  function checkImageUri(cardImagePath: string): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function () {
            resolve(`https://api.gatcg.com${cardImagePath}?rounded=true`);
        };
 
        img.onerror = function () {
            const fallbackImg = new Image();
            fallbackImg.onload = function() {
                resolve(`https://api.gatcg.com${cardImagePath}?rounded=true`);
            }
           
            fallbackImg.onerror = function () {
                resolve(`https://api.gatcg.com${cardImagePath}`);
            }
            
            fallbackImg.src = `https://api.gatcg.com${cardImagePath}`;
        };
 
        img.src = `https://api.gatcg.com${cardImagePath}?rounded=true`;
    });
  }
  
  async function generateImageUri(selectedOptionImagePath: string): Promise<string> {
    try {
      const validUri = await checkImageUri(selectedOptionImagePath);
      return validUri;
    } 
    catch (error) {
      console.error("Error generating image URI:", error);
      return '';
    }
  }

  function downloadCanvas() {
    console.log(`Generated file ${selectedChampion}-${selectedElement}.png`);
    const dataUrl = canvasRef.current!.toDataURL('image/png');

    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = `${selectedChampion}-${selectedElement}.png`;
    

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  React.useEffect(() => {
    if(isLoading) {
      fetchData();
    }
  }, []);

  React.useEffect(() => {
    // Draw on canvas
    const canvas = canvasRef.current;
    if(!canvas) return;

    const context = canvas.getContext('2d');

    const image1 = new Image();
    image1.crossOrigin = 'anonymous';
    image1.src = imageUri1;
    image1.onload = () => {
      const image2 = new Image();
      image2.crossOrigin = 'anonymous';
      image2.src = imageUri2;
      image2.onload = () => {
        // Clip original images
        context!.save();

        context!.beginPath();
        context!.moveTo(0, 0);
        context!.lineTo(350, 0);
        context!.lineTo(0, 350);
        context!.closePath();
        context!.clip();

        context!.drawImage(image1, 72, 72, 350, 350, 0, 0, 350, 350);

        context!.restore();

        context!.save();

        context!.beginPath();
        context!.moveTo(0, 350);
        context!.lineTo(350, 0);
        context!.lineTo(350, 350);
        context!.closePath();
        context!.clip();

        context!.drawImage(image2, 72, 72, 350, 350, 0, 0, 350, 350);

        context!.restore();

        // Create new image
        const pattern1 = context!.createPattern(canvas, 'no-repeat');
        const pattern2 = context!.createPattern(canvas, 'no-repeat');

        // Draw patterns on the canvas
        context!.fillStyle = pattern1!;
        context!.fillRect(0, 0, 350, 350);

        context!.fillStyle = pattern2!;
        context!.fillRect(0, 350, 350, 350);
      }
    }
  }, [imageUri1, imageUri2]);

  return (
    <main className="flex min-h-screen flex-col items-center m-0">
      <div className="content">
        <h1 className="text-center font-bold text-2xl my-4">Champion/Element Graphic Generator</h1>
        <div className="flex flex-col items-center">
          <div className="flex flex-col sm:flex-row gap-2 m-4">
            {championsList.length == 0 && 
              <span className='text-2xl font-bold text-violet-400'>Loading...</span>
            }
            {championsList.length > 0 && elementsList.length > 0 && 
              <>
                <div className='flex flex-col gap-2'>
                <span className='text-sm font-bold'>Champions</span>
                <Select
                  className='basic-single w-[320px] font-bold text-black'
                  classNamePrefix='select'
                  theme={(theme) => ({
                    ...theme,
                    borderRadius: 4,
                    colors: {
                      ...theme.colors,
                      text: 'black',
                      primary: '#9999FF',
                    },
                  })}
                  styles={{
                    option: provided => ({
                      ...provided,
                      color: 'black',
                    }),
                  }}
                  defaultValue={championsList[0]}
                  isLoading={isLoading}
                  isSearchable={true}
                  name='Champion'
                  options={championsList}
                  onChange={async (selectedOption) => {
                    setSelectedChampion(addUnderscore(selectedOption!.getName()));
                    setImageUri1(await generateImageUri(selectedOption!.getImagePath()));
                  }}
                />
                </div>
                <div className='flex flex-col gap-2'>
                  <span className='text-sm font-bold'>Elements</span>
                  <Select
                    className='basic-single w-[320px] font-bold text-black'
                    classNamePrefix='select'
                    theme={(theme) => ({
                      ...theme,
                      borderRadius: 4,
                      colors: {
                        ...theme.colors,
                        text: 'black',
                        primary: '#9999FF',
                      },
                    })}
                    styles={{
                      option: provided => ({
                        ...provided,
                        color: 'black',
                      }),
                    }}
                    defaultValue={elementsList[0]}
                    isLoading={isLoading}
                    isSearchable={true}
                    name='Element'
                    options={elementsList}
                    onChange={async (selectedOption) => {
                      setSelectedElement(addUnderscore(selectedOption!.getName()));
                      setImageUri2(await generateImageUri(selectedOption!.getImagePath()));
                    }}
                  />
                </div>
              </>
            }
          </div>
          <div className='flex flex-col items-center'>
            <canvas className='' ref={canvasRef} width={350} height={350} />
            <button 
              className='border-solid border border-black rounded font-bold p-2 m-4 hover:border-violet-400 hover:text-violet-400 hover:shadow-lg'
              onClick={downloadCanvas}
              >
              Download PNG
            </button>
            <p className="m-2 text-center">If the button isn&apos;t working for whatever reason, you can right click the image and save it that way.</p>
            <p className="m-2 text-center">All card artworks displayed are copyright &copy;Weebs of the Shore.</p>
          </div>
        </div>
      </div>
      <div className="sm:absolute bottom-0 text-center">
        <span>Please report any bugs to <b className='text-violet-400'>number.four</b> on Discord.</span>
      </div>
    </main>
  )
}
