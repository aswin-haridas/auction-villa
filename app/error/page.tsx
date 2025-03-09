const Error = ({ text, link }: { text: string; link: string }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
            <div className="text-center">
                <h1 className="text-2xl mb-4">{text}</h1>
                <a 
                    href={link} 
                    className="text-red-500 hover:underline transition-all"
                >
                    Take me from here.
                </a>
            </div>
        </div>
    );
};

export default Error;
