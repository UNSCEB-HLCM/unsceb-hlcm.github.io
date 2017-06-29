/*
 * Copyright (c) 2015-2016 Pixware SARL. All rights reserved.
 * 
 * Author: Hussein Shafie
 * 
 * This file is part of the XMLmind W2X project.
 * For conditions of distribution and use, see the accompanying legal.txt file.
 *
 * Gives a width to all span class=role-tab. 
 * This code is invoked by the web browser at the end of 
 * the document loading process.
 */

function w2x_expandTabs() {
    var paras = document.getElementsByTagName("P"); // HTML.
    if (paras.length === 0) {
        paras = document.getElementsByTagName("p"); // XHTML.
    }
    for (var i = 0; i < paras.length; ++i) {
        var para = paras[i];

        var tabStops = w2x_getTabStops(para);
        if (tabStops) {
            var body = w2x_lookupBody(para);
            if (body) {
                w2x_doExpandTabs(para, tabStops,
                                 body.getBoundingClientRect().left);
            }
        }
    }
}

function w2x_getTabStops(para) {
    var tabStops = null;

    var role = para.getAttribute("class");
    if (role && role.indexOf("role-tabs-") === 0) {
        tabStops = new Array();

        var end = role.indexOf(" ");
        if (end < 0) {
            end = role.length;
        }
        var split = role.substring(10, end).split("-");

        for (var i = 0; i < split.length; ++i) {
            var tabStop = parseFloat(split[i]);
            if (isNaN(tabStop) || tabStop < 0) {
                tabStops = null;
                break;
            }

            // Convert pt to px.
            tabStops.push(Math.round((tabStop * 96) / 72));
        }

        if (tabStops && (tabStops.length < 2 || tabStops[1] !== 0)) {
            tabStops = null;
        }
    }

    return tabStops;
}

function w2x_lookupBody(para) {
    var parent = para.parentElement;
    while (parent !== null) {
        var parentName = parent.tagName;
        if (parentName == "TD" ||  parentName == "td" ||
            parentName == "TH" ||  parentName == "th" ||
            parent.getAttribute("id") == "wh-content" || // Web Help only.
            parentName == "BODY" ||  parentName == "body") {
            return parent;
        }

        parent = parent.parentElement;
    }

    // Should not happen.
    return null;
}

function w2x_doExpandTabs(subTree, tabStops, bodyX) {
    var node = subTree.firstChild;
    while (node !== null) {
       if (node.nodeType === 1) { // Child element.
            if ((node.tagName == "SPAN" || node.tagName == "span") &&
                node.getAttribute("class") == "role-tab") {
                w2x_expandTab(node, tabStops, bodyX);
            } else {
                w2x_doExpandTabs(node, tabStops, bodyX);
            }
        }

        node = node.nextSibling;
    }
}

function w2x_expandTab(span, tabStops, bodyX) {
    var tabX = Math.round(span.getBoundingClientRect().left - bodyX);
    if (tabX < 0) {
        return;
    }

    var tabX2 = -1;

    var autoTabStop = tabStops[0];
    var tabStop = 0;
    var i = 1;
    for (var j = 0; j < 1000; ++j) { // Default tabStop=0.5in; 0.5in*1000=12.7m
        var nextTabStop;
        if (i+1 < tabStops.length) {
            nextTabStop = tabStops[++i];
        } else {
            nextTabStop = tabStop + (autoTabStop - (tabStop % autoTabStop));
        }

        if (tabX >= tabStop && tabX < nextTabStop) {
            tabX2 = nextTabStop;
            break;
        }

        tabStop = nextTabStop;
    }

    if (tabX2 > tabX) {
        var width = tabX2 - tabX;

        span.style.display = "inline-block";
        span.style.width = (width + "px");
    }
}

/* DO NOT CHANGE THIS LAST LINE AS IT IS AUTOMATICALLY REPLACED 
   BY jQuery CODE WHEN Web Help IS GENERATED. */
window.onload = w2x_expandTabs;
