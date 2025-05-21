import { useState } from 'react';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddSprintModal from './AddSprintModal';
import { useSprintService } from '../services/sprintService';

interface SprintButtonProps {
  buttonText?: string;
  fullWidth?: boolean;
  onSprintCreated?: () => void;
}

const SprintButton = ({ buttonText = "Create Sprint", fullWidth = false, onSprintCreated }: SprintButtonProps) => {
  const [openSprintModal, setOpenSprintModal] = useState(false);
  const [isAddingSprint, setIsAddingSprint] = useState(false);
  const sprintService = useSprintService();
  
  // Modal açma/kapama işlevleri
  const handleOpenSprintModal = () => setOpenSprintModal(true);
  const handleCloseSprintModal = () => setOpenSprintModal(false);
  
  // Yeni sprint ekleme fonksiyonu
  const handleAddSprint = async (sprintName: string) => {
    if (!sprintName.trim()) return;
    
    setIsAddingSprint(true);
    
    try {
      // API çağrısı ile sprint ekle
      const response = await sprintService.addSprint(sprintName);
      console.log('Sprint eklendi:', response);
      
      // İşlem başarılı
      setIsAddingSprint(false);
      // Modal'ı kapat
      handleCloseSprintModal();
      
      // Notify the parent component about sprint creation (if callback provided)
      if (onSprintCreated) {
        onSprintCreated();
      }
    } catch (error) {
      console.error('Sprint ekleme hatası:', error);
      setIsAddingSprint(false);
    }
  };

  return (
    <>
      <Button 
        variant="contained" 
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleOpenSprintModal}
        fullWidth={fullWidth}
        sx={{ 
          borderRadius: 3, 
          px: { xs: 2, md: 4 },
          py: { xs: 1, md: 1.5 },
          boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          background: 'linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)', // Mavi/mor tonlar
          minWidth: { xs: '180px', sm: '200px' },
          '&:hover': {
            boxShadow: '0 8px 20px rgba(63,81,181,0.25)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        {buttonText}
      </Button>
      
      {/* Sprint Ekleme Modal'ı */}
      <AddSprintModal 
        open={openSprintModal} 
        onClose={handleCloseSprintModal} 
        onAdd={handleAddSprint}
        isAdding={isAddingSprint}
      />
    </>
  );
};

export default SprintButton;
