import event from '../../eventBus'
export const loading = true;
const useLoadingBarComposable = () => {

    const startLoader = () => {  
        event.emit('loader-start');
        loading = true;  
    };
    const endLoader = () => {  
        event.emit('loader-end');
        loading = false;
    };
    const hideLoader = () => { 
        event.emit('loader-hide');
    };
    return {
        startLoader,
        endLoader,
        hideLoader
    };
  };

export default useLoadingBarComposable;
