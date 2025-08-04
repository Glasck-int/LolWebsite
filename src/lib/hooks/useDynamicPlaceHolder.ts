    // const strings = ['LEC', 'KCORP', 'LCK', 'La ligue francaise']

    // const [placeholder, setPlaceholder] = useState('')
    // const [stringIndex, setStringIndex] = useState(0)

    // useEffect(() => {
    //     let currentString = strings[stringIndex]
    //     let charIndex = 0

    //     const typeInterval = setInterval(() => {
    //         if (charIndex < currentString.length) {
    //             setPlaceholder((prev) => prev + currentString[charIndex])
    //             charIndex++
    //         } else {
    //             clearInterval(typeInterval)

    //             setTimeout(() => {
    //                 setPlaceholder('')
    //                 setStringIndex((prev) => (prev + 1) % strings.length)
    //             }, 5000)
    //         }
    //     }, 300)

    //     return () => clearInterval(typeInterval)
    // }, [stringIndex])