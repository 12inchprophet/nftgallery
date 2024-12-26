import React, { useState, useEffect } from '@blocklet/pages-kit/builtin/react';
import { Box, Typography, Grid, IconButton } from '@blocklet/pages-kit/builtin/mui/material';

export default function NFTGallery({
  title = 'My NFT Gallery',
  backgroundImage = '',
  backgroundOpacity = 99,
  backgroundColor = '#ffffff',
  fontFamily = 'Arial, sans-serif',
  topPadding = '10px',
  bottomPadding = '10px',
  showCarousel = true,
  autoTransition = false,
  transitionInterval = 3000, // Transition interval in milliseconds
  columnCount = 3, // Number of columns for grid view
  did1, did2, did3, did4, did5, did6, did7, did8, did9, did10,
}) {
  const [nftDataList, setNftDataList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [opacity, setOpacity] = useState(1); // For fade transitions

  const dids = [
    did1, did2, did3, did4, did5, did6, did7, did8, did9, did10,
  ].filter(Boolean);

  const fetchNFTData = async (did) => {
    const query = `
      query {
        getAssetState(address: "${did.trim()}") {
          state {
            address
            moniker
            display {
              content
            }
          }
        }
      }
    `;

    const endpoint = 'https://main.abtnetwork.io/api';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.data && result.data.getAssetState) {
        const state = result.data.getAssetState.state;
        const imageUrl = `https://www.didspaces.com/app/resolve/display?assetId=${state.address}`;
        return {
          moniker: state.moniker || 'Unnamed Asset',
          image: imageUrl,
        };
      }
      throw new Error('Invalid data structure');
    } catch (err) {
      console.error('Error fetching NFT data:', err);
      return null;
    }
  };

  useEffect(() => {
    const loadNFTs = async () => {
      const nftList = await Promise.all(dids.map(fetchNFTData));
      setNftDataList(nftList.filter(Boolean));
    };

    if (dids.length > 0) {
      loadNFTs();
    }
  }, [dids]);

  useEffect(() => {
    if (autoTransition && nftDataList.length > 1) {
      const fadeOut = () => {
        setOpacity(0); // Start fading out
        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % nftDataList.length);
          setOpacity(1); // Fade back in
        }, transitionInterval / 3); // Fade duration
      };

      const interval = setInterval(fadeOut, transitionInterval);
      return () => clearInterval(interval);
    }
  }, [autoTransition, nftDataList, transitionInterval]);

  const handlePrev = () => {
    setOpacity(0);
    setTimeout(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? nftDataList.length - 1 : prevIndex - 1
      );
      setOpacity(1);
    }, transitionInterval / 3);
  };

  const handleNext = () => {
    setOpacity(0);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % nftDataList.length);
      setOpacity(1);
    }, transitionInterval / 3);
  };

  if (nftDataList.length === 0) {
    console.log('No NFT data loaded.'); // Debugging
    return null;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        padding: `${topPadding} 20px ${bottomPadding}`,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily,
        backgroundColor,
        overflow: 'hidden',
      }}
    >
      {/* Background Image */}
      {backgroundImage && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: backgroundOpacity / 100,
            zIndex: 0,
          }}
        />
      )}

      {/* Title */}
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontFamily, zIndex: 1 }}
      >
        {title}
      </Typography>

      {/* Carousel or Grid View */}
      {showCarousel ? (
        nftDataList.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80%',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Left Navigation Button */}
            {!autoTransition && (
              <IconButton
                onClick={handlePrev}
                sx={{
                  position: 'absolute',
                  left: '-40px',
                  zIndex: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: '#fff',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                }}
              >
                {'<'}
              </IconButton>
            )}

            {/* Image Display */}
            <Box
              sx={{
                opacity,
                transition: `opacity ${transitionInterval / 3000}s ease-in-out`,
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center',
              }}
            >
              <img
                src={nftDataList[currentIndex]?.image}
                alt={nftDataList[currentIndex]?.moniker || ''}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '10px',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                }}
              />
              <Typography
                variant="h6"
                sx={{ marginTop: '10px', fontFamily }}
              >
                {nftDataList[currentIndex]?.moniker || 'Unnamed Asset'}
              </Typography>
            </Box>

            {/* Right Navigation Button */}
            {!autoTransition && (
              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: '-40px',
                  zIndex: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: '#fff',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                }}
              >
                {'>'}
              </IconButton>
            )}
          </Box>
        )
      ) : (
        <Grid container spacing={2} sx={{ width: '80%', zIndex: 1 }}>
          {nftDataList.map((nft, index) => (
            <Grid item xs={12} sm={12 / columnCount} md={12 / columnCount} key={index}>
              <Box
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                  padding: '20px',
                  textAlign: 'center',
                  backgroundColor: '#fff',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontFamily, marginBottom: '10px' }}
                >
                  {nft.moniker}
                </Typography>
                <img
                  src={nft.image}
                  alt={nft.moniker}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '10px',
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
