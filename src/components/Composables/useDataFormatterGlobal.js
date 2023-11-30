const useDataFormatterGlobal = () => {

    const dataFormatter = (value) => {  
        if (value === undefined || value === null || value === '') {
            return '--';
          } else if (typeof value === 'number') {
            return parseFloat(value.toFixed(3));
          } else {
            return value;
        }   
    };
    const statusIcon = (status) => {  
        switch (status) {
            case 'OK':
              return 'success';
            case 'Warning':
              return 'warning';
            case 'Critical':
              return 'danger';
            default:
              return '';
          }   
    }; 
    const dataFormatterArray = (value) => {  
        return value.join(', ');
 
    };   

    return {
        dataFormatter,
        statusIcon,
        dataFormatterArray
    };
  };

export default useDataFormatterGlobal;
