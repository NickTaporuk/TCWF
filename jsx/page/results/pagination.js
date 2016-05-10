define([
    'react',
    'classnames'
], function(
    React,
    cn
) {

    return {
        countPages: 1,
        getDefaultProps: function() {
            return {
                activePage: 1,
                itemsOnPage: 6,
                totalItems: 0,
                maxPagesInView: 5,
                onPageClick: null
            }
        },
        render: function() {
            var countPages;
            var activePage;
            if (this.props.totalItems && this.props.itemsOnPage) {
                // if totalItems > 0 and this.props.itemsOnPage > 0 
                // console.log(this.props.totalItems, this.props.itemsOnPage);
                countPages = Math.ceil(this.props.totalItems/this.props.itemsOnPage);
                activePage = this.props.activePage;
            } else {
                // to show at least one page in any case
                countPages = 1;
                activePage = 1;
            }
            this.countPages = countPages; 
            if (countPages == 1) {
                return null;
            }
            var maxPagesInView = this.props.maxPagesInView;
            var countPagesInView = countPages < maxPagesInView ? countPages : maxPagesInView;
            var middleInView = Math.ceil(countPagesInView/2);
            var isFirstDotted = activePage > middleInView;
            var isLastDotted = (countPages - activePage)  >= middleInView;
            var firstVisiblePage = activePage <= middleInView ? 1 : (activePage - middleInView + 1);
            var lastVisiblePage = (countPages - activePage) < middleInView ? countPages : (activePage + middleInView - 1);
            if (lastVisiblePage < countPagesInView && countPages >= countPagesInView) {
                lastVisiblePage = countPagesInView;
            }
            if ((countPages - firstVisiblePage) < countPagesInView && countPages >= countPagesInView) {
                firstVisiblePage = countPages - countPagesInView + 1;
            }
            var pages = [];
            // -1 and +1 in expresion needed to include prev and next btn;
            for (var p = firstVisiblePage-1; p <= lastVisiblePage+1; p++) {
                var page = p,
                    text,
                    desc;
                
                if (p < firstVisiblePage) {
                    page = activePage - 1;
                    text = { __html: '&laquo; Prev' };
                    desc = activePage == 1 ?  <span dangerouslySetInnerHTML={text} /> : <a href="#" onClick={this.handlePageOnClick.bind(this, page)} dangerouslySetInnerHTML={text} />;
                } else if (p > lastVisiblePage) {
                    page = activePage + 1;
                    text = { __html: 'Next &raquo;' };
                    desc = activePage == countPages ?  <span dangerouslySetInnerHTML={text} /> : <a href="#" onClick={this.handlePageOnClick.bind(this, page)} dangerouslySetInnerHTML={text} />;
                } else {
                    text = (countPages > maxPagesInView && ((isFirstDotted && p == firstVisiblePage) || (isLastDotted && p == lastVisiblePage))) ? '..' : p;
                    desc =  (p == activePage) ? <span className={cn('paginator_active')}>{text}</span> : <a href="#" onClick={this.handlePageOnClick.bind(this, page)}>{text}</a>;
                }

                pages.push(<li key={p} className={cn({})}>{desc}</li>);
            }
            return (
                <ul className={cn('paginator')} role="menu" aria-label="Pagination">
                    {pages}
                </ul>
            );
        },
        handlePageOnClick: function(pageNumber, event) {
            if (pageNumber >= 1 && pageNumber <= this.countPages && this.props.activePage !== pageNumber && typeof this.props.onPageClick == 'function') {
                this.props.onPageClick(pageNumber, event);
            }
        }
    };
});